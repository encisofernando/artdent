// 📁 src/services/cashService.js
import api from "./api";
import { unwrap } from "./utils";


export const openCashSession = async ({ cash_drawer_id, opening_amount, opened_at }) =>
unwrap(await api.post("/cash-sessions/open", { cash_drawer_id, opening_amount, opened_at }));


export const closeCashSession = async ({ session_id, closing_amount, closed_at }) =>
unwrap(await api.post(`/cash-sessions/${session_id}/close`, { closing_amount, closed_at }));


export const cashIn = async ({ session_id, amount, payment_method_id, note }) =>
unwrap(await api.post(`/cash-sessions/${session_id}/in`, { amount, payment_method_id, note }));


export const cashOut = async ({ session_id, amount, payment_method_id, note }) =>
unwrap(await api.post(`/cash-sessions/${session_id}/out`, { amount, payment_method_id, note }));