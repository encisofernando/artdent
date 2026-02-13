import api from "./api";
import { unwrap } from "./utils";

// Obtiene la empresa actual asociada al usuario autenticado
export const get = async () => {
  try {
    return await unwrap(api.get('/companies/me'));
  } catch (e) {
    // Compatibilidad con frontend legacy
    if (e?.response?.status === 404) {
      return await unwrap(api.get('/company'));
    }
    throw e;
  }
};
