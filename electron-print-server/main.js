const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFile } = require('child_process');
const express = require('express');
const cors = require('cors');
const settings = require('electron-settings');

// En dev, scripts/ está junto a main.js. Empaquetado, va dentro de
// app.asar — pero powershell.exe no puede leer un archivo DENTRO del
// asar (necesita un path real de filesystem), así que ese archivo se
// desempaqueta aparte (ver "asarUnpack" en package.json) a
// app.asar.unpacked/scripts/print-raw.ps1.
function getPrintRawScriptPath() {
    return app.isPackaged
        ? path.join(process.resourcesPath, 'app.asar.unpacked', 'scripts', 'print-raw.ps1')
        : path.join(__dirname, 'scripts', 'print-raw.ps1');
}

let tray = null;
let workerWindow = null;
let configWindow = null;
let printLogs = [];

/* ---------------- CONFIG ---------------- */

const getPort = () => settings.getSync('port') || 1234;
const getPrinterName = () => settings.getSync('printerName') || ''; //

/* ---------------- EXPRESS SERVER ---------------- */

const server = express();
server.use(cors());
server.use(express.json({ limit: '50mb' }));

/* ---------------- COLA DE IMPRESION ---------------- */

let printQueue = [];
let printing = false;

function processQueue() {
    if (printing || printQueue.length === 0) return;
    printing = true;
    const job = printQueue.shift();

    executePrint(job.html, job.mode, job.res, () => {
        printing = false;
        setTimeout(() => {
            processQueue();
        }, 50);
    });
}

/* ---------------- LOGS ---------------- */

function addLog(message, type = 'info') {
    const log = {
        time: new Date().toLocaleTimeString(),
        message,
        type
    };
    printLogs.push(log);
    if (printLogs.length > 50) printLogs.shift();
    if (configWindow) {
        configWindow.webContents.send('update-logs', printLogs);
    }
}

function injectHeadStyle(html, css) {
    if (!html || !css) return html;

    const styleTag = `<style id="artdent-print-normalize">${css}</style>`;
    return html.includes('</head>')
        ? html.replace('</head>', `${styleTag}</head>`)
        : `${styleTag}${html}`;
}

function normalizePrintMode(mode) {
    return mode === '54mm' ? '57mm' : mode;
}

function normalizeHtmlForPrint(html) {
    return injectHeadStyle(html, `
        html, body {
            margin: 0 !important;
            background: #fff !important;
        }
    `);
}

async function waitForWorkerAssets(timeoutMs = 4000) {
    try {
        const summary = await workerWindow.webContents.executeJavaScript(`
            (async function () {
                const timeout = ${timeoutMs};
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                const images = Array.from(document.images || []);

                const waitForImage = (img) => {
                    if (img.complete && img.naturalWidth !== 0) {
                        if (typeof img.decode === 'function') {
                            return img.decode().catch(() => {});
                        }

                        return Promise.resolve();
                    }

                    return new Promise((resolve) => {
                        let settled = false;

                        const finish = async () => {
                            if (settled) return;
                            settled = true;

                            if (typeof img.decode === 'function') {
                                try {
                                    await img.decode();
                                } catch {}
                            }

                            resolve();
                        };

                        img.addEventListener('load', finish, { once: true });
                        img.addEventListener('error', finish, { once: true });
                        setTimeout(finish, 1200);
                    });
                };

                if (document.fonts?.ready) {
                    try {
                        await Promise.race([document.fonts.ready, wait(timeout)]);
                    } catch {}
                }

                await Promise.race([
                    Promise.all(images.map(waitForImage)),
                    wait(timeout),
                ]);

                await wait(120);

                return {
                    imageCount: images.length,
                    unresolved: images.filter((img) => !img.complete || img.naturalWidth === 0).length,
                };
            })();
        `, true);

        addLog(`Recursos listos: ${summary.imageCount} imagen(es), ${summary.unresolved} sin resolver.`);
    } catch (error) {
        addLog(`Aviso al esperar recursos: ${error.message}`, 'error');
    }
}

/* ---------------- IMPRESION ---------------- */

// "192.168.1.62:9100" — impresora térmica de red, mismo protocolo raw/JetDirect
// que ya usa la app Android (ThermalPrinterPlugin::printRaw). Evita por completo
// el spooler/driver de Windows, que en la práctica no soporta tamaños de página
// arbitrarios en la mayoría de las impresoras térmicas y termina cayendo a A4.
const NETWORK_PRINTER_RE = /^([\w.-]+):(\d+)$/;

function executePrint(html, mode, res = null, done = null) {
    const widthMicrons = (mode === '57mm' || mode === '54mm') ? 50000 : 74000;
    const printerName = getPrinterName();
    const networkMatch = printerName ? printerName.match(NETWORK_PRINTER_RE) : null;

    // Dispositivo crudo (Linux, /dev/...) o impresora de red (cualquier plataforma):
    // en ambos casos evitamos el spooler del SO y mandamos el raster directo.
    if (process.platform === 'linux' && printerName && printerName.startsWith('/dev/')) {
        executePrintRasterESCPOS(html, mode, { transport: 'device', devicePath: printerName }, res, done);
        return;
    }

    if (networkMatch) {
        executePrintRasterESCPOS(html, mode, { transport: 'network', host: networkMatch[1], port: Number(networkMatch[2]) }, res, done);
        return;
    }

    // Impresora térmica por USB en Windows, instalada con su driver normal
    // (nombre de impresora de Windows, no ip:puerto ni /dev/...): el driver
    // casi nunca soporta un pageSize custom vía webContents.print() y cae a
    // A4 (ticket angosto "flotando" en una hoja grande, con margen enorme y
    // a veces recortado si el driver limita el alto). Se manda el mismo
    // raster ESC/POS que el resto de los caminos, pero por la API RAW de
    // Windows (winspool.drv vía print-raw.ps1) en vez del spooler/GDI.
    if (process.platform === 'win32' && printerName) {
        executePrintRasterESCPOS(html, mode, { transport: 'windows-raw', printerName }, res, done);
        return;
    }

    const printableHtml = normalizeHtmlForPrint(html);
    workerWindow.webContents.setZoomFactor(1);
    workerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(printableHtml)}`);

    workerWindow.webContents.once('did-finish-load', async () => {
        await waitForWorkerAssets();

        // Measure actual content height so we don't advance blank paper.
        // CSS pixels → microns: px / 96 dpi * 25.4 mm/in * 1000 µm/mm
        let heightMicrons = 200000; // 200 mm safety fallback
        try {
            const contentPx = await workerWindow.webContents.executeJavaScript(`
                Math.ceil(Math.max(
                    document.body ? document.body.scrollHeight : 0,
                    document.documentElement ? document.documentElement.scrollHeight : 0
                ))
            `);
            if (contentPx > 0) {
                heightMicrons = Math.ceil(contentPx / 96 * 25.4 * 1000) + 8000; // +8 mm bottom margin
            }
        } catch (e) {
            addLog(`Aviso al medir alto: ${e.message}`, 'error');
        }

        workerWindow.webContents.print({
            silent: true,
            printBackground: true,
            deviceName: printerName,
            margins: { marginType: 'none' },
            pageSize: {
                width: widthMicrons,
                height: heightMicrons,
            }
        }, (success, error) => {
            if (!success) {
                addLog(`Error: ${error}`, 'error');
                if (res) res.status(500).json({ error });
            } else {
                addLog(`Impresión exitosa en: ${printerName || 'Predeterminada'}`);
                if (res) res.json({ success: true });
            }
            workerWindow.webContents.session.clearCache();
            if (done) done();
        });
    });
}

/* --------------- ESC/POS DIRECTO (dispositivo local o impresora de red) --------------- */

function sendRasterBuffer(escposBuffer, target, callback) {
    if (target.transport === 'device') {
        fs.writeFile(target.devicePath, escposBuffer, (err) => {
            if (err) return callback(err);
            callback(null, `dispositivo ${target.devicePath}`);
        });
        return;
    }

    if (target.transport === 'windows-raw') {
        const tmpFile = path.join(os.tmpdir(), `artdent-ticket-${Date.now()}.bin`);
        fs.writeFile(tmpFile, escposBuffer, (writeErr) => {
            if (writeErr) return callback(writeErr);

            const scriptPath = getPrintRawScriptPath();
            execFile('powershell.exe', [
                '-NoProfile',
                '-ExecutionPolicy', 'Bypass',
                '-File', scriptPath,
                '-PrinterName', target.printerName,
                '-FilePath', tmpFile,
            ], (err, stdout, stderr) => {
                fs.unlink(tmpFile, () => {});

                if (err || !String(stdout).includes('OK')) {
                    return callback(new Error(stderr?.trim() || err?.message || 'print-raw.ps1 falló'));
                }

                callback(null, `USB (RAW) ${target.printerName}`);
            });
        });
        return;
    }

    // Mismo protocolo raw/JetDirect que ThermalPrinterPlugin::printRaw en Android:
    // conectar, mandar los bytes, medio-cerrar la escritura y esperar un margen
    // corto por si la impresora responde algo (la mayoría no responde nada).
    const net = require('net');
    const socket = new net.Socket();
    let settled = false;

    const finish = (err) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        callback(err || null, `${target.host}:${target.port}`);
    };

    socket.setTimeout(5000);
    socket.on('timeout', () => finish(new Error(`Timeout conectando a ${target.host}:${target.port}`)));
    socket.on('error', (err) => finish(err));

    socket.connect(target.port, target.host, () => {
        socket.end(escposBuffer, () => {
            setTimeout(() => finish(null), 300);
        });
    });
}

async function executePrintRasterESCPOS(html, mode, target, res, done) {
    // 384px @ 203dpi — mismo ancho que usa el raster de la app Android
    // (RASTER_WIDTH_BY_MM en resources/js/lib/escpos/renderJobTicket.js),
    // para que ambos caminos de impresión apunten al mismo tamaño físico.
    const printWidthPx = (mode === '57mm' || mode === '54mm') ? 384 : 576;
    const rasterHtml = normalizeHtmlForPrint(html);
    try {
        // 1. Cargar con alto amplio para medir contenido real
        workerWindow.webContents.setZoomFactor(1);
        workerWindow.setContentSize(printWidthPx, 2000);
        workerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(rasterHtml)}`);

        await new Promise(resolve =>
            workerWindow.webContents.once('did-finish-load', resolve)
        );
        await waitForWorkerAssets();

        // 2. Escalar el ticket al ancho raster final y medir el alto real antes de capturar.
        const metrics = await workerWindow.webContents.executeJavaScript(`
            (function() {
                var style = document.createElement('style');
                style.textContent = \`
                    html, body {
                        background: #fff !important;
                        margin: 0 !important;
                    }
                \`;
                document.head.appendChild(style);
                
                // Ajusta el ancho del ticket al raster objetivo antes de medir el alto final.
                var root = document.getElementById('print-zone') || document.body || document.documentElement;
                var measuredWidth = Math.ceil(root.getBoundingClientRect().width || ${printWidthPx});
                var scale = measuredWidth > 0 ? (${printWidthPx} / measuredWidth) : 1;

                if (Math.abs(scale - 1) > 0.01) {
                    root.style.zoom = String(scale);
                    root.style.transformOrigin = 'top left';
                }

                var contentHeight = Math.ceil(Math.max(
                    document.body ? document.body.scrollHeight : 0,
                    document.documentElement ? document.documentElement.scrollHeight : 0,
                    document.body ? document.body.getBoundingClientRect().height : 0,
                    document.documentElement ? document.documentElement.getBoundingClientRect().height : 0
                ));

                return {
                    measuredWidth: measuredWidth,
                    scale: scale,
                    contentHeight: contentHeight
                };
            })();
        `);
        // Dimensionamos la ventana al tamaño final impreso.
        addLog(`ESC/POS ${mode}: ancho base ${metrics.measuredWidth}px, escala ${Number(metrics.scale || 1).toFixed(3)}, destino ${printWidthPx}px`);
        workerWindow.setContentSize(printWidthPx, Math.ceil(metrics.contentHeight) + 4);
        await new Promise(r => setTimeout(r, 150));

        // 3. Capturar solo el contenido medido
        const nativeImg = await workerWindow.webContents.capturePage();
        const pngBuffer = nativeImg.toPNG();

        const Jimp = require('jimp');
        let img = await Jimp.read(pngBuffer);

        const capturedW = img.bitmap.width;
        const capturedH = img.bitmap.height;

        // Mezclar con fondo blanco (por si algún pixel tiene alfa > 0 y se oscurece)
        const bg = new Jimp(capturedW, capturedH, 0xFFFFFFFF);
        bg.composite(img, 0, 0);
        img = bg;

        // Guardar captura para depurar localmente en la carpeta del proyecto
        await img.writeAsync(require('path').join(app.getPath('userData'), 'ticket-debug.png'));

        // Volvemos a un procesamiento sin manipulaciones agresivas porque
        // Chromium renderiza la fuente vectorialmente nítida en negro puro.
        img.grayscale();

        // Umbral estricto: la fuente es puro negro (0) y fondo es puro blanco (255) gracias
        // al zoom de la pantalla. Un umbral de 100 asegura que la sombra del anti-aliasing (gris medio)
        // se convierta en papel en lugar de engordar la letra al imprimir.
        const bmpNative = img.bitmap;
        const nativeLen = bmpNative.data.length;
        for (let i = 0; i < nativeLen; i += 4) {
            const val = bmpNative.data[i] < 100 ? 0 : 255;
            bmpNative.data[i]     = val;
            bmpNative.data[i + 1] = val;
            bmpNative.data[i + 2] = val;
        }

        // Ya NO HACE FALTA hacer img.resize, porque Chromium ya lo renderizó a printWidthPx


        const w = img.bitmap.width;
        const fullH = img.bitmap.height;
        const data = img.bitmap.data;

        // Encontrar la primera y la última fila con pixel negro — recorta el
        // blanco sobrante arriba Y abajo (antes sólo se recortaba abajo, y el
        // margen superior en blanco quedaba tal cual salía del render).
        let firstContentRow = -1;
        let lastContentRow = 0;
        for (let y = 0; y < fullH; y++) {
            for (let x = 0; x < w; x++) {
                if (data[(y * w + x) * 4] === 0) {
                    if (firstContentRow === -1) firstContentRow = y;
                    lastContentRow = y;
                    break;
                }
            }
        }
        const cropTop = Math.max(firstContentRow === -1 ? 0 : firstContentRow - 10, 0);
        const cropH = Math.min(lastContentRow + 20, fullH) - cropTop;
        addLog(`Recortando a ${w}×${cropH}px (arriba ${cropTop}px)`);
        img.crop(0, cropTop, w, cropH);

        const h = cropH;
        const bytesPerRow = Math.ceil(w / 8);
        const finalData = img.bitmap.data;

        // Construir buffer ESC/POS — todos los pixels son 0 o 255
        const imgBytes = Buffer.alloc(bytesPerRow * h, 0);
        for (let y = 0; y < h; y++) {
            for (let bx = 0; bx < bytesPerRow; bx++) {
                let byte = 0;
                for (let bit = 0; bit < 8; bit++) {
                    const x = bx * 8 + bit;
                    if (x < w && finalData[(y * w + x) * 4] === 0) byte |= (0x80 >> bit);
                }
                imgBytes[y * bytesPerRow + bx] = byte;
            }
        }


        // Armar comando GS v 0 (raster bit image)
        const header = Buffer.from([
            0x1B, 0x40,                          // ESC @ — Inicializar
            0x1B, 0x33, 0x00,                    // ESC 3 n — interlineado mínimo
            0x1D, 0x76, 0x30, 0x00,              // GS v 0 m
            bytesPerRow & 0xFF, (bytesPerRow >> 8) & 0xFF, // xL xH
            h & 0xFF,           (h >> 8) & 0xFF  // yL yH
        ]);
        const footer = Buffer.from([
            0x1B, 0x64, 0x05,   // ESC d 5 — avanzar 5 líneas
            0x1D, 0x56, 0x41, 0x10 // GS V A — corte parcial
        ]);

        const escposBuffer = Buffer.concat([header, imgBytes, footer]);

        sendRasterBuffer(escposBuffer, target, (err, targetLabel) => {
            if (err) {
                addLog(`Error ESC/POS: ${err.message}`, 'error');
                if (res) res.status(500).json({ error: err.message });
            } else {
                addLog(`Impresión ESC/POS exitosa en: ${targetLabel}`);
                if (res) res.json({ success: true });
            }
            if (done) done();
        });

    } catch (err) {
        addLog(`Error ESC/POS: ${err.message}`, 'error');
        if (res) res.status(500).json({ error: err.message });
        if (done) done();
    }
}

/* ---------------- API ---------------- */

server.post('/print', (req, res) => {
    const { html, mode } = req.body;
    addLog(`Petición externa recibida (${mode})`);
    printQueue.push({ html, mode, res });
    processQueue();
});

/* ---------------- TEST PRINT ---------------- */

ipcMain.on('print-test-ticket', () => {
    addLog("Generando ticket de prueba...");
    const testHtml = `
<html>
<head>
<style>
body{ font-family:Segoe UI; margin:0; padding:10px; text-align:center; width:57mm; }
.header{ font-weight:bold; font-size:18px; color:#397B9C; }
.separator{ border-top:1px dashed #000; margin:10px 0; }
.status{ color:#5AAD9C; font-weight:bold; }
</style>
</head>
<body>
<div class="header">ARTDENT</div>
<div style="font-size:12px;">PRUEBA DE CONEXIÓN</div>
<div class="separator"></div>
<div class="status">SISTEMA ACTIVO</div>
<div style="font-size:11px;margin-top:5px;">
Fecha: ${new Date().toLocaleDateString()}<br>
Hora: ${new Date().toLocaleTimeString()}
</div>
<div class="separator"></div>
<div style="font-size:10px;color:#666;">
Impresora: ${getPrinterName() || 'Predeterminada'}<br>
Formosa, Argentina
</div>
</body>
</html>`;

    printQueue.push({ html: testHtml, mode: '57mm' });
    processQueue();
});

/* ---------------- CONFIG WINDOW ---------------- */

function createConfigWindow() {
    if (configWindow) return configWindow.focus();
    configWindow = new BrowserWindow({
        width: 600,
        height: 620, // Aumentado ligeramente para el select
        title: "Configuración ArtDent Print",
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    configWindow.loadFile('config.html');
    configWindow.on('closed', () => configWindow = null);
}

/* ---------------- APP READY ---------------- */

// Configurar inicio automático según el sistema operativo
if (process.platform === 'linux') {
    // En Linux usamos el estándar XDG autostart (.desktop en ~/.config/autostart)
    const autostartDir = path.join(app.getPath('home'), '.config', 'autostart');
    const desktopFile = path.join(autostartDir, 'artdent-print.desktop');
    const exePath = app.getPath('exe');
    const desktopEntry = [
        '[Desktop Entry]',
        'Type=Application',
        'Name=ArtDent Print Service',
        'Comment=Servidor de impresión ArtDent',
        `Exec=${exePath}`,
        'Icon=artdent-print',
        'Terminal=false',
        'X-GNOME-Autostart-enabled=true',
    ].join('\n');
    try {
        if (!fs.existsSync(autostartDir)) {
            fs.mkdirSync(autostartDir, { recursive: true });
        }
        fs.writeFileSync(desktopFile, desktopEntry, 'utf8');
    } catch (e) {
        console.warn('No se pudo crear el archivo de autostart:', e.message);
    }
} else {
    app.setLoginItemSettings({
        openAtLogin: true,
        path: app.getPath('exe')
    });
}

app.whenReady().then(() => {
    workerWindow = new BrowserWindow({
        show: false,
        backgroundColor: '#ffffff',
        webPreferences: {
            offscreen: true,
            sandbox: false
        }
    });

    tray = new Tray(path.join(__dirname, 'icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'ArtDent Print Service', enabled: false },
        { label: 'Configuración / Logs', click: createConfigWindow },
        { type: 'separator' },
        { label: 'Reiniciar', click: () => { app.relaunch(); app.exit(); } },
        { label: 'Salir', click: () => app.quit() }
    ]);

    tray.setContextMenu(contextMenu);
    tray.setToolTip('ArtDent Print Service');

    server.listen(getPort(), () => {
        addLog(`Servidor iniciado en puerto ${getPort()}`);
    });
});

/* ---------------- IPC ---------------- */

ipcMain.on('save-config', (event, data) => {
    settings.setSync('port', data.port);
    settings.setSync('printerName', data.printerName); //
    addLog(`Configuración actualizada satisfactoriamente.`);
});

ipcMain.on('get-initial-data', async (event) => {
    // Obtenemos las impresoras instaladas en el sistema
    const printers = await workerWindow.webContents.getPrintersAsync();
    event.reply('initial-data', {
        port: getPort(),
        printerName: getPrinterName(),
        printers: printers, //
        logs: printLogs
    });
});

/* ---------------- PREVENT CLOSE ---------------- */

app.on('window-all-closed', e => e.preventDefault());
