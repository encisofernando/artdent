const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

try {
    let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: 'tcp://127.0.0.1:9000', // Dummy interface to bypass init throw
        removeSpecialCharacters: true,
    });

    printer.println("Hello World");
    printer.cut();

    let buffer = printer.getBuffer();
    console.log("Success, buffer length:", buffer.length);
} catch (e) {
    console.error(e);
}
