package com.artdent.pos;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;

@CapacitorPlugin(name = "ThermalPrinter")
public class ThermalPrinterPlugin extends Plugin {

    private static final int CONNECT_TIMEOUT_MS = 5000;
    private static final String ACTION_USB_PERMISSION = "com.artdent.pos.USB_PERMISSION";

    private PluginCall pendingUsbCall;

    @PluginMethod
    public void printRaw(PluginCall call) {
        String ip = call.getString("ip");
        int port = call.getInt("port", 9100);
        String bytesBase64 = call.getString("bytesBase64");

        if (ip == null || ip.isEmpty()) {
            call.reject("Falta la IP de la impresora.");
            return;
        }

        if (bytesBase64 == null || bytesBase64.isEmpty()) {
            call.reject("Falta el contenido a imprimir.");
            return;
        }

        new Thread(() -> {
            try {
                byte[] data = Base64.decode(bytesBase64, Base64.DEFAULT);

                try (Socket socket = new Socket()) {
                    socket.connect(new InetSocketAddress(ip, port), CONNECT_TIMEOUT_MS);
                    socket.setSoLinger(true, 3);
                    OutputStream out = socket.getOutputStream();
                    out.write(data);
                    out.flush();

                    // Medio-cierre: le avisa al otro extremo que ya no hay más datos y le da
                    // un margen para que el SO termine de entregar el buffer antes de cortar
                    // la conexión. La mayoría de las impresoras de red no responden nada, así
                    // que un timeout corto (no una espera indefinida de EOF) es lo esperado.
                    socket.shutdownOutput();
                    socket.setSoTimeout(2000);

                    try {
                        InputStream in = socket.getInputStream();
                        byte[] buf = new byte[256];
                        while (in.read(buf) != -1) {
                            // drenar cualquier respuesta hasta EOF o timeout
                        }
                    } catch (java.net.SocketTimeoutException expected) {
                        // Normal: la impresora no cierra su lado de la conexión.
                    }
                }

                JSObject result = new JSObject();
                result.put("ok", true);
                call.resolve(result);
            } catch (Exception e) {
                call.reject("No se pudo imprimir: " + e.getMessage(), e);
            }
        }).start();
    }

    @PluginMethod
    public void listUsbDevices(PluginCall call) {
        UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
        JSArray list = new JSArray();

        for (UsbDevice device : usbManager.getDeviceList().values()) {
            JSObject item = new JSObject();
            item.put("vendorId", device.getVendorId());
            item.put("productId", device.getProductId());
            item.put("productName", device.getProductName() != null ? device.getProductName() : "");
            list.put(item);
        }

        JSObject result = new JSObject();
        result.put("devices", list);
        call.resolve(result);
    }

    @PluginMethod
    public void printRawUsb(PluginCall call) {
        Integer vendorId = call.getInt("vendorId");
        Integer productId = call.getInt("productId");
        String bytesBase64 = call.getString("bytesBase64");

        if (vendorId == null || productId == null) {
            call.reject("Falta seleccionar la impresora USB.");
            return;
        }

        if (bytesBase64 == null || bytesBase64.isEmpty()) {
            call.reject("Falta el contenido a imprimir.");
            return;
        }

        UsbManager usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);
        UsbDevice targetDevice = null;

        for (UsbDevice device : usbManager.getDeviceList().values()) {
            if (device.getVendorId() == vendorId && device.getProductId() == productId) {
                targetDevice = device;
                break;
            }
        }

        if (targetDevice == null) {
            call.reject("No se encontró la impresora USB. ¿Está conectada?");
            return;
        }

        if (!usbManager.hasPermission(targetDevice)) {
            requestUsbPermission(usbManager, targetDevice, call);
            return;
        }

        writeToUsbDevice(usbManager, targetDevice, bytesBase64, call);
    }

    private void requestUsbPermission(UsbManager usbManager, UsbDevice device, PluginCall call) {
        pendingUsbCall = call;
        call.setKeepAlive(true);

        int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ? PendingIntent.FLAG_MUTABLE : 0;
        PendingIntent permissionIntent = PendingIntent.getBroadcast(
            getContext(), 0, new Intent(ACTION_USB_PERMISSION), flags
        );

        BroadcastReceiver receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (!ACTION_USB_PERMISSION.equals(intent.getAction())) {
                    return;
                }

                context.unregisterReceiver(this);

                PluginCall savedCall = pendingUsbCall;
                pendingUsbCall = null;

                if (savedCall == null) {
                    return;
                }

                boolean granted = intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false);

                if (!granted) {
                    savedCall.reject("Permiso USB denegado.");
                    return;
                }

                String bytesBase64 = savedCall.getString("bytesBase64");
                writeToUsbDevice(usbManager, device, bytesBase64, savedCall);
            }
        };

        IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getContext().registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(receiver, filter);
        }

        usbManager.requestPermission(device, permissionIntent);
    }

    private void writeToUsbDevice(UsbManager usbManager, UsbDevice device, String bytesBase64, PluginCall call) {
        new Thread(() -> {
            UsbDeviceConnection connection = null;

            try {
                UsbInterface printerInterface = null;
                UsbEndpoint outEndpoint = null;

                for (int i = 0; i < device.getInterfaceCount(); i++) {
                    UsbInterface usbInterface = device.getInterface(i);

                    for (int e = 0; e < usbInterface.getEndpointCount(); e++) {
                        UsbEndpoint endpoint = usbInterface.getEndpoint(e);

                        if (endpoint.getType() == UsbConstants.USB_ENDPOINT_XFER_BULK
                                && endpoint.getDirection() == UsbConstants.USB_DIR_OUT) {
                            printerInterface = usbInterface;
                            outEndpoint = endpoint;
                            break;
                        }
                    }

                    if (outEndpoint != null) {
                        break;
                    }
                }

                if (printerInterface == null || outEndpoint == null) {
                    call.reject("La impresora USB no tiene un endpoint de salida compatible.");
                    return;
                }

                connection = usbManager.openDevice(device);

                if (connection == null) {
                    call.reject("No se pudo abrir la conexión USB con la impresora.");
                    return;
                }

                connection.claimInterface(printerInterface, true);

                byte[] data = Base64.decode(bytesBase64, Base64.DEFAULT);
                int chunkSize = outEndpoint.getMaxPacketSize();
                int offset = 0;

                while (offset < data.length) {
                    int length = Math.min(chunkSize, data.length - offset);
                    byte[] chunk = new byte[length];
                    System.arraycopy(data, offset, chunk, 0, length);

                    int sent = connection.bulkTransfer(outEndpoint, chunk, length, 5000);

                    if (sent < 0) {
                        call.reject("Falló el envío por USB (offset " + offset + ").");
                        return;
                    }

                    offset += length;
                }

                JSObject result = new JSObject();
                result.put("ok", true);
                call.resolve(result);
            } catch (Exception e) {
                call.reject("No se pudo imprimir por USB: " + e.getMessage(), e);
            } finally {
                if (connection != null) {
                    connection.close();
                }
            }
        }).start();
    }
}
