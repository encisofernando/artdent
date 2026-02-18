import api from "./api";
import { unwrap } from "./utils";

export type CompanyMeResponse = unknown;

export const get = async () => {
  try {
    return await unwrap<CompanyMeResponse>(api.get("/companies/me"));
  } catch (e: any) {
    // Compatibilidad legacy
    if (e?.response?.status === 404) {
      return await unwrap<CompanyMeResponse>(api.get("/company"));
    }
    throw e;
  }
};

export default { get };
