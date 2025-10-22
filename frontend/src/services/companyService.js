import api from "./api";

/** Intenta un GET y devuelve null si es 404; relanza otros errores */
const safeGet = async (url) => {
  try {
    const { data } = await api.get(url);
    return data ?? null;
  } catch (err) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
};

export const getMyCompany = async () => {
  // orden de prueba hasta que exista el endpoint real en Laravel
  return (
    (await safeGet("api/company")) ??
    (await safeGet("api/companies/me")) ??
    null
  );
};

export const getCompanyById = async (id) => {
  if (!id) return null;
  return (
    (await safeGet(`api/companies/${id}`)) ??
    (await safeGet(`api/company/${id}`)) ??
    null
  );
};

export default { getMyCompany, getCompanyById };
