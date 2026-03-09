const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
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
    // Mantenemos tus 50.000 micrones para 57mm
    const widthMicrons = (mode === '57mm' || mode === '54mm') ? 50000 : 74000; //

    workerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    workerWindow.webContents.once('did-finish-load', () => {
        workerWindow.webContents.print({
            silent: true,
            printBackground: true,
            deviceName: getPrinterName(), //
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
                addLog(`Impresión exitosa en: ${getPrinterName() || 'Predeterminada'}`); //
                if (res) res.json({ success: true });
            }

            workerWindow.webContents.session.clearCache();
            if (done) done();
        });
    });
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

app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe')
});

app.whenReady().then(() => {
    workerWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            offscreen: true,
            sandbox: false // Cambiado para permitir acceso a impresoras
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