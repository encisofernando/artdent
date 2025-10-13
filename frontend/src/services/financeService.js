// 📁 src/services/financeService.js
import api from "./api";
import { unwrap } from "./utils";


export const createReceipt = async ({ sale_id, payment_method_id, amount, reference, receipt_date }) =>
unwrap(
await api.post("/receipts", { sale_id, payment_method_id, amount, reference, receipt_date })
);


export const createPayment = async ({ purchase_id, payment_method_id, amount, reference, payment_date }) =>
unwrap(
await api.post("/payments", { purchase_id, payment_method_id, amount, reference, payment_date })
);

