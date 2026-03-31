const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');
const cors = require('cors');
const settings = require('electron-settings');

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

/* ---------------- IMPRESION ---------------- */

function executePrint(html, mode, res = null, done = null) {
    const widthMicrons = (mode === '57mm' || mode === '54mm') ? 50000 : 74000;
    const printerName = getPrinterName();

    // En Linux con dispositivo directo (/dev/...) usamos ESC/POS
    if (process.platform === 'linux' && printerName && printerName.startsWith('/dev/')) {
        executePrintLinuxESCPOS(html, mode, printerName, res, done);
        return;
    }

    workerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    workerWindow.webContents.once('did-finish-load', () => {
        workerWindow.webContents.print({
            silent: true,
            printBackground: true,
            deviceName: printerName,
            margins: { marginType: 'none' },
            pageSize: {
                width: widthMicrons,
                height: 200000
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

/* --------------- ESC/POS DIRECTO (Linux) --------------- */

async function executePrintLinuxESCPOS(html, mode, devicePath, res, done) {
    // 388px = ~48.5mm @ 203dpi (-1.5mm respecto al anterior 400px)
    const printWidthPx = (mode === '57mm' || mode === '54mm') ? 388 : 576;
    const screenWidthPx = 216; // ~57mm a 96dpi — el HTML tiene width:50mm y se renderiza aquí naturalmente

    try {
        // 1. Cargar con alto amplio para medir contenido real
        workerWindow.setContentSize(screenWidthPx, 2000);
        workerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        await new Promise(resolve =>
            workerWindow.webContents.once('did-finish-load', resolve)
        );
        await new Promise(r => setTimeout(r, 300));

        // 2. Medir el alto real del contenido ampliado antes de capturar.
        // El zoom ahora lo provee nativamente Show.jsx / Create.jsx.
        const contentHeight = await workerWindow.webContents.executeJavaScript(`
            (function() {
                var style = document.createElement('style');
                style.textContent = \`
                    html, body {
                        background: #fff !important;
                        margin: 0 !important;
                    }
                \`;
                document.head.appendChild(style);
                
                // Mide el alto, incluyendo el efecto de cualquier zoom nativo del HTML
                return document.documentElement.getBoundingClientRect().height;
            })();
        `);
        // Dimensionamos la ventana al tamaño FINAL impreso (440px / 576px)
        workerWindow.setContentSize(printWidthPx, Math.ceil(contentHeight) + 4);
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

        // Encontrar la última fila con pixel negro
        let lastContentRow = 0;
        for (let y = 0; y < fullH; y++) {
            for (let x = 0; x < w; x++) {
                if (data[(y * w + x) * 4] === 0) { lastContentRow = y; break; }
            }
        }
        const cropH = Math.min(lastContentRow + 20, fullH);
        addLog(`Recortando a ${w}×${cropH}px`);
        img.crop(0, 0, w, cropH);

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

        fs.writeFile(devicePath, escposBuffer, (err) => {
            if (err) {
                addLog(`Error ESC/POS: ${err.message}`, 'error');
                if (res) res.status(500).json({ error: err.message });
            } else {
                addLog(`Impresión ESC/POS exitosa en: ${devicePath}`);
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