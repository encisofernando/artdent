// 📁 src/services/warehouseService.js
import api from "./api";
import { unwrap } from "./utils";


export const listWarehouses = async () => unwrap(await api.get("/warehouses"));
export const listPaymentMethods = async () => unwrap(await api.get("/payment-methods"));
export const listTaxes = async () => unwrap(await api.get("/taxes"));