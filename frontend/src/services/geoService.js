// 📁 src/services/geoService.js
import api from "./api";
import { unwrap } from "./utils";

export const listProvinces = async () => {
  const paths = ["/provinces", "/provincias"];
  for (const p of paths) {
    try { return unwrap(await api.get(p)); } catch (e) {}
  }
  return [];
};
