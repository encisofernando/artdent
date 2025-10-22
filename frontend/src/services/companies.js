import api from "./api";
import { unwrap } from "./utils";

// Obtiene la empresa actual asociada al usuario autenticado
export const get = () => unwrap(api.get("/company"));
