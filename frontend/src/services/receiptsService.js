// 📁 src/services/receiptsService.js
import api from "./api";
import { unwrap } from "./utils";

/**
 * Crea un comprobante/recibo de pago asociado a una venta.
 * Backend: POST /receipts
 */
export const createReceipt = async (payload) => unwrap(await api.post("/receipts", payload));
