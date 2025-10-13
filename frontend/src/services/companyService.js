// 📁 src/services/companyService.js
import api from "./api";
import { unwrap } from "./utils";

export const getMyCompany = async () => {
  try { return unwrap(await api.get("/company")); }
  catch {
    try { return unwrap(await api.get("/empresa")); }
    catch { return null; }
  }
};

export const getCompanyById = async (id) => {
  if (!id) return await getMyCompany();
  const paths = [`/companies/${id}`, `/company/${id}`, `/empresas/${id}`, `/empresa/${id}`];
  for (const p of paths) {
    try { return unwrap(await api.get(p)); } catch {}
  }
  return null;
};
