const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');

let tray = null;
let workerWindow = null;
const server = express();

server.use(cors());
server.use(express.json({ limit: '50mb' }));

// Servidor Express interno en el puerto 1234
server.post('/print', (req, res) => {
    const { html, mode } = req.body;

    // Cargamos el HTML recibido en la ventana oculta
    workerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    workerWindow.webContents.on('did-finish-load', () => {
        const widthMicrons = (mode === '57mm' || mode === '54mm') ? 57000 : 80000;

        workerWindow.webContents.print({
            silent: true,
            printBackground: true,
            deviceName: '', // Usa la impresora predeterminada de Windows
            pageSize: { width: widthMicrons, height: 200000 }
        }, (success, failureReason) => {
            if (!success) return res.status(500).json({ error: failureReason });
            res.json({ success: true });
        });
    });
});

app.whenReady().then(() => {
    // 1. Ventana oculta para renderizar
    workerWindow = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true } });

    // 2. Icono en la barra de tareas (Tray)
    const iconPath = path.join(__dirname, 'icon.png'); // Usa tu logo-artdent-icon.png
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'ArtDent Print Service', enabled: false },
        { type: 'separator' },
        { label: 'Reiniciar Servicio', click: () => app.relaunch() },
        { label: 'Salir', click: () => app.quit() }
    ]);
    tray.setToolTip('ArtDent: Listo para imprimir');
    tray.setContextMenu(contextMenu);

    server.listen(1234, () => console.log('Print server running on port 1234'));
});

// Evitar que la app se cierre al cerrar ventanas
app.on('window-all-closed', e => e.preventDefault());