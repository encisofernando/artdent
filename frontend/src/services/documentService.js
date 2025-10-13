// 📁 src/services/documentService.js
import api from "./api";
import { unwrap } from "./utils";

export const listDocTypes = async () => {
  const paths = ["/document-types", "/tipos-documento", "/tipo-doc", "/tipo-documento"];
  for (const p of paths) {
    try { return unwrap(await api.get(p)); } catch (e) {}
  }
  return [];
};
