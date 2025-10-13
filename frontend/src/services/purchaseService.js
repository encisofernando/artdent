// 📁 src/services/purchaseService.js
import api from "./api";
import { unwrap, toQueryString } from "./utils";


export const listPurchases = async (params = {}) => {
const qs = toQueryString(params);
return unwrap(await api.get(`/purchases${qs ? `?${qs}` : ""}`));
};


export const createPurchase = async ({
company_id,
warehouse_id,
purchase_date,
items = [], // [{ product_id, qty, unit_cost, tax_rate? }]
observations = null,
supplier_id = null,
invoice_number = null,
}) =>
unwrap(
await api.post("/purchases", {
company_id,
warehouse_id,
purchase_date,
items,
observations,
supplier_id,
invoice_number,
})
);