// 📁 src/services/taxService.js
import api from "./api";
import { unwrap } from "./utils";

export const listIvaConditions = async () => {
  const paths = ["/iva-conditions", "/condicion-iva", "/iva/condiciones"];
  for (const p of paths) {
    try { return unwrap(await api.get(p)); } catch (e) {}
  }
  return [];
};
