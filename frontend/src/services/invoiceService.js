// 📁 src/services/invoiceService.js
import api from "./api";
import { unwrap } from "./utils";

/** Tipos de comprobante (tabla invoice_types) */
export const listInvoiceTypes = async () => unwrap(await api.get("/invoice-types"));

/** Crea factura para una venta.
 *  payload: { sale_id, invoice_type_id | invoice_type_code, pos_number, invoice_number?, issue_date, items? }
 *  Si solo mandás sale_id + invoice_type_code + issue_date, el backend puede copiar renglones de la venta.
 */
export const createInvoice = async (payload) => {
  // si viene solo el "code", resolvemos id en base a /invoice-types
  if (!payload.invoice_type_id && payload.invoice_type_code) {
    try {
      const types = await listInvoiceTypes();
      const found = (types || []).find((t) => String(t.code).toUpperCase() === String(payload.invoice_type_code).toUpperCase());
      if (found) payload = { ...payload, invoice_type_id: found.id };
    } catch (e) {
      // si falla, el backend podría aceptar "invoice_type_code" igualmente
    }
  }
  return unwrap(await api.post("/invoices", payload));
};

export const getInvoice = async (id) => unwrap(await api.get(`/invoices/${id}`));
