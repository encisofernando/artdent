const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const settings = require('electron-settings');

let tray = null;
let workerWindow = null;
let configWindow = null;
let printLogs = [];

const getPort = () => settings.getSync('port') || 1234;

const server = express();
server.use(cors());
server.use(express.json({ limit: '50mb' }));

app.setLoginItemSettings({ openAtLogin: true, path: app.getPath('exe') });

function addLog(message, type = 'info') {
    const log = { time: new Date().toLocaleTimeString(), message, type };
    printLogs.push(log);
    if (printLogs.length > 50) printLogs.shift();
    if (configWindow) configWindow.webContents.send('update-logs', printLogs);
}

// Lógica de impresión genérica
function executePrint(html, mode, res = null) {
    workerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    workerWindow.webContents.once('did-finish-load', () => {
        // 57mm roll = 50mm printable area (50000 microns)
        // 80mm roll = 74mm printable area (74000 microns)
        const widthMicrons = (mode === '57mm' || mode === '54mm') ? 50000 : 74000;
        workerWindow.webContents.print({
            silent: true,
            printBackground: true,
            margins: { marginType: 'none' }, // <-- Elimina margenes por defecto del sistema
            pageSize: { width: widthMicrons, height: 200000 }
        }, (success, error) => {
            if (!success) {
                addLog(`Error: ${error}`, 'error');
                if (res) res.status(500).json({ error });
            } else {
                addLog('Impresión exitosa');
                if (res) res.json({ success: true });
            }
        });
    });
}

server.post('/print', (req, res) => {
    const { html, mode } = req.body;
    addLog(`Petición externa recibida (${mode})`);
    executePrint(html, mode, res);
});

// ESCUCHA PARA TICKET DE PRUEBA DESDE LA VENTANA
ipcMain.on('print-test-ticket', () => {
    addLog("Generando ticket de prueba...");
    const testHtml = `
        <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 10px; text-align: center; width: 57mm; }
                    .header { font-weight: bold; font-size: 18px; color: #397B9C; }
                    .separator { border-top: 1px dashed #000; margin: 10px 0; }
                    .status { color: #5AAD9C; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">ARTDENT</div>
                <div style="font-size: 12px;">PRUEBA DE CONEXIÓN</div>
                <div class="separator"></div>
                <div class="status">SISTEMA ACTIVO</div>
                <div style="font-size: 11px; margin-top: 5px;">
                    Fecha: ${new Date().toLocaleDateString()}<br>
                    Hora: ${new Date().toLocaleTimeString()}
                </div>
                <div class="separator"></div>
                <div style="font-size: 10px; color: #666;">
                    Servicio de Impresión Local<br>Formosa, Argentina
                </div>
            </body>
        </html>
    `;
    executePrint(testHtml, '57mm');
});

function createConfigWindow() {
    if (configWindow) return configWindow.focus();
    configWindow = new BrowserWindow({
        width: 600, height: 550,
        title: "Configuración ArtDent Print",
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    configWindow.loadFile('config.html');
    configWindow.on('closed', () => configWindow = null);
}

app.whenReady().then(() => {
    workerWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false } });
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
    server.listen(getPort(), () => addLog(`Servidor iniciado en puerto ${getPort()}`));
});

ipcMain.on('save-port', (event, newPort) => {
    settings.setSync('port', newPort);
    addLog(`Puerto cambiado a ${newPort}. Reinicie para aplicar.`, 'info');
});

ipcMain.on('get-initial-data', (event) => {
    event.reply('initial-data', { port: getPort(), logs: printLogs });
});

app.on('window-all-closed', e => e.preventDefault());