// src/services/productService.js
import api from "./api";

// Map API → UI (acepta claves ES/EN)
const toUI = (p = {}) => ({
  idArticulo: p.idArticulo ?? p.id ?? null,
  id: p.idArticulo ?? p.id ?? null,
  Nombre: p.Nombre ?? p.name ?? "",
  Descripcion: p.Descripcion ?? p.description ?? "",
  Codigo: p.Codigo ?? p.sku ?? "",
  CodigoBarra: p.CodigoBarra ?? p.barcode ?? "",
  PrecioPublico: Number(p.PrecioPublico ?? p.price ?? 0),
  Costo: Number(p.Costo ?? p.cost ?? 0),
  Iva: Number(p.Iva ?? p.tax_rate ?? 0),
  idCategoria: p.idCategoria ?? p.category_id ?? null,
  Activo: p.Activo != null ? Number(p.Activo) === 1 : !!p.is_active,
  Stock: Number(p.Stock ?? p.stock ?? 0),
  StockMin: Number(p.StockMin ?? p.min_stock ?? 0),
  ImagenUrl: p.ImagenUrl ?? p.image_url ?? "",
});

const unwrapRows = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  return [];
};
const unwrapObj = (res) => res?.data?.data ?? res?.data ?? res;

// Intenta múltiples endpoints hasta que alguno responda 200 OK
const firstOkGET = async (paths = [], params) => {
  let lastErr;
  for (const p of paths) {
    try {
      const r = await api.get(p, params ? { params } : undefined);
      return r;
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
};
const firstOkPOST = async (paths = [], body, cfg) => {
  let lastErr;
  for (const p of paths) {
    try {
      const r = await api.post(p, body, cfg);
      return r;
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
};
const firstOkPUT = async (paths = [], body, cfg) => {
  let lastErr;
  for (const p of paths) {
    try {
      const r = await api.put(p, body, cfg);
      return r;
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
};
const firstOkDELETE = async (paths = []) => {
  let lastErr;
  for (const p of paths) {
    try {
      const r = await api.delete(p);
      return r;
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
};

// Rutas posibles
const LIST_PATHS = ["/products"];
const ONE_PATHS  = (id) => [`/products/${id}`];

export const listProducts = async (params = {}) => {
  const r = await firstOkGET(LIST_PATHS, params);
  return unwrapRows(r).map(toUI);
};

export const getProduct = async (id) => {
  const r = await firstOkGET(ONE_PATHS(id));
  return toUI(unwrapObj(r));
};

const toBackend = (payload) => {
  if (payload instanceof FormData) return payload;
  const fd = new FormData();
  Object.entries(payload || {}).forEach(([k, v]) => {
    if (k === "Imagen" && v instanceof File) fd.append("Imagen", v);
    else fd.append(k, v ?? "");
  });
  return fd;
};

export const createProduct = async (payload) => {
  const fd = toBackend(payload);
  const r = await firstOkPOST(LIST_PATHS, fd, { headers: { "Content-Type": "multipart/form-data" } });
  return toUI(unwrapObj(r));
};

export const updateProduct = async (id, payload) => {
  const fd = toBackend(payload);
  // compat Laravel
  fd.append("_method", "PUT");
  const r = await firstOkPOST(ONE_PATHS(id), fd, { headers: { "Content-Type": "multipart/form-data" } });
  return toUI(unwrapObj(r));
};

export const deleteProduct = async (id) => {
  const r = await firstOkDELETE(ONE_PATHS(id));
  return unwrapObj(r);
};

export const toggleProductActive = async (id) => {
  // Si existe /toggle-active lo usamos, si no, hacemos fallback con PUT invertido
  try {
    const r = await firstOkPOST(ONE_PATHS(id).map(p => `${p}/toggle-active`));
    return toUI(unwrapObj(r));
  } catch {
    const cur = await getProduct(id);
    const next = { ...cur, activo: cur.Activo ? 0 : 1 };
    const r = await firstOkPUT(ONE_PATHS(id), next);
    return toUI(unwrapObj(r));
  }
};
