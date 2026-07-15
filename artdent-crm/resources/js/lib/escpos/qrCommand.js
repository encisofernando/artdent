const GS = 0x1d;

export const QR_ERROR_CORRECTION = {
    L: 48,
    M: 49,
    Q: 50,
    H: 51,
};

export function buildQrBytes(data, { moduleSize = 6, errorCorrection = QR_ERROR_CORRECTION.M } = {}) {
    const dataBytes = Array.from(new TextEncoder().encode(data));
    const storeLen = dataBytes.length + 3;
    const pL = storeLen & 0xff;
    const pH = (storeLen >> 8) & 0xff;

    return [
        // Modelo QR (modelo 2, el estándar)
        GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00,
        // Tamaño de módulo
        GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, moduleSize,
        // Nivel de corrección de errores
        GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, errorCorrection,
        // Almacenar los datos a codificar
        GS, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30, ...dataBytes,
        // Imprimir el QR almacenado
        GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x52, 0x30,
    ];
}
