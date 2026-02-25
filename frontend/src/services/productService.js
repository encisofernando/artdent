// src/services/productService.js
import api from "./api";

/** Utils */
const asNumber = (v, fallback = 0) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
};

const unwrapRows = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data; // paginator laravel
  if (Array.isArray(d?.results)) return d.results;
  return [];
};

const unwrapObj = (res) => res?.data?.data ?? res?.data ?? res;

/** API → UI */
const toUI = (p = {}) => ({
  idArticulo: p.idArticulo ?? p.id ?? null,
  id: p.idArticulo ?? p.id ?? null,

  // UI Spanish
  Nombre: p.Nombre ?? p.name ?? "",
  Descripcion: p.Descripcion ?? p.description ?? "",
  Codigo: p.Codigo ?? p.sku ?? "",
  CodigoBarra: p.CodigoBarra ?? p.barcode ?? "",
  PrecioPublico: asNumber(p.PrecioPublico ?? p.price ?? 0),
  Costo: asNumber(p.Costo ?? p.cost ?? 0),
  Iva: asNumber(p.Iva ?? p.tax_rate ?? 0),
  idCategoria: p.idCategoria ?? p.category_id ?? null,
  Activo:
    p.Activo != null ? Number(p.Activo) === 1 : !!(p.is_active ?? true),

  // Stock: si backend lo devuelve, lo usamos; si no, queda 0
  Stock: asNumber(p.Stock ?? p.stock ?? 0),
  StockMin: asNumber(p.StockMin ?? p.min_stock ?? 0),

  // Imagen primaria (si backend la devuelve)
  ImagenUrl: p.ImagenUrl ?? p.image_url ?? "",
});

/** UI/Modal → Backend (JSON) */
const toBackend = (payload = {}) => {
  // Si viene en formato ES (por compatibilidad), lo traducimos a columnas reales
  const out = {};

  // Campos DB reales (prioridad)
  if (payload.name != null) out.name = payload.name;
  if (payload.sku != null) out.sku = payload.sku;
  if (payload.barcode != null) out.barcode = payload.barcode;
  if (payload.description != null) out.description = payload.description;
  if (payload.unit != null) out.unit = payload.unit;
  if (payload.category_id !== undefined) out.category_id = payload.category_id;
  if (payload.cost != null) out.cost = payload.cost;
  if (payload.price != null) out.price = payload.price;
  if (payload.tax_rate != null) out.tax_rate = payload.tax_rate;
  if (payload.tax_id !== undefined) out.tax_id = payload.tax_id;
  if (payload.is_active != null) out.is_active = payload.is_active;
  if (payload.track_stock != null) out.track_stock = payload.track_stock;
  if (payload.min_stock != null) out.min_stock = payload.min_stock;

  // Compat Spanish → DB
  if (payload.Nombre != null && out.name == null) out.name = payload.Nombre;
  if (payload.Codigo != null && out.sku == null) out.sku = payload.Codigo;
  if (payload.CodigoBarra != null && out.barcode == null) out.barcode = payload.CodigoBarra;
  if (payload.Descripcion != null && out.description == null) out.description = payload.Descripcion;
  if (payload.Unidad != null && out.unit == null) out.unit = payload.Unidad;
  if (payload.idCategoria != null && out.category_id == null) out.category_id = payload.idCategoria;
  if (payload.Costo != null && out.cost == null) out.cost = payload.Costo;
  if (payload.PrecioPublico != null && out.price == null) out.price = payload.PrecioPublico;
  if (payload.Iva != null && out.tax_rate == null) out.tax_rate = payload.Iva;
  if (payload.idIva != null && out.tax_id == null) out.tax_id = payload.idIva;
  if (payload.Activo != null && out.is_active == null) out.is_active = payload.Activo;
  if (payload.ControlarStock != null && out.track_stock == null) out.track_stock = payload.ControlarStock;
  if (payload.StockMin != null && out.min_stock == null) out.min_stock = payload.StockMin;

  // Normalizaciones numéricas/boolean
  if (out.category_id === "" || out.category_id === null) out.category_id = null;
  if (out.tax_id === "" || out.tax_id === null) out.tax_id = null;

  if (out.cost != null) out.cost = asNumber(out.cost, 0);
  if (out.price != null) out.price = asNumber(out.price, 0);
  if (out.tax_rate != null) out.tax_rate = asNumber(out.tax_rate, 0);
  if (out.min_stock != null) out.min_stock = asNumber(out.min_stock, 0);

  return out;
};

/** Paths (por si hay prefijos en tu API) */
const LIST_PATHS = ["/products"];
const ONE_PATHS = (id) => [`/products/${id}`];

/** Categories/Taxes (si tenés esos endpoints) */
const CAT_PATHS = ["/categories"];
const TAX_PATHS = ["/taxes"];

/** Images (según tu ProductImagesController) */
const IMG_LIST_PATHS = (id) => [`/products/${id}/images`];
const IMG_PRIMARY_PATHS = (id, imageId) => [`/products/${id}/images/${imageId}/primary`];
const IMG_DELETE_PATHS = (id, imageId) => [`/products/${id}/images/${imageId}`];

/** Helpers: intenta rutas alternativas */
const firstOkGET = async (paths, params) => {
  let lastErr;
  for (const p of paths) {
    try {
      return await api.get(p, params ? { params } : undefined);
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
};
const firstOkPOST = async (paths, body, cfg) => {
  let lastErr;
  for (const p of paths) {
    try {
      return await api.post(p, body, cfg);
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
};
const firstOkPUT = async (paths, body, cfg) => {
  let lastErr;
  for (const p of paths) {
    try {
      return await api.put(p, body, cfg);
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
};
const firstOkDELETE = async (paths) => {
  let lastErr;
  for (const p of paths) {
    try {
      return await api.delete(p);
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
};

/** Products */
export const listProducts = async (params = {}) => {
  const r = await firstOkGET(LIST_PATHS, params);
  return unwrapRows(r).map(toUI);
};

/**
 * Versión paginada — devuelve { items, total, lastPage, currentPage }
 * Compatible con la respuesta del paginator de Laravel:
 *   { current_page, data: [...], last_page, total, per_page }
 */
export const listProductsPaginated = async (params = {}) => {
  const r = await firstOkGET(LIST_PATHS, params);
  const d = r?.data;

  // Laravel paginator: { data: [...], last_page, total, current_page }
  if (d && Array.isArray(d.data) && d.last_page != null) {
    return {
      items:       d.data.map(toUI),
      total:       d.total       ?? null,
      lastPage:    d.last_page   ?? null,
      currentPage: d.current_page ?? params.page ?? 1,
    };
  }

  // Array plano (fallback: sin metadatos de paginación)
  const items = Array.isArray(d) ? d : [];
  return {
    items:       items.map(toUI),
    total:       null,
    lastPage:    null,
    currentPage: params.page ?? 1,
  };
};

export const getProduct = async (id) => {
  const r = await firstOkGET(ONE_PATHS(id));
  return toUI(unwrapObj(r));
};

export const createProduct = async (payload) => {
  const body = toBackend(payload);
  const r = await firstOkPOST(LIST_PATHS, body);
  return toUI(unwrapObj(r));
};

export const updateProduct = async (id, payload) => {
  const body = toBackend(payload);
  const r = await firstOkPUT(ONE_PATHS(id), body);
  return toUI(unwrapObj(r));
};

export const deleteProduct = async (id) => {
  const r = await firstOkDELETE(ONE_PATHS(id));
  return unwrapObj(r);
};

export const toggleProductActive = async (id) => {
  // No existe en tu ProductsController, así que hacemos update invertido
  const cur = await getProduct(id);
  const next = { is_active: !cur.Activo };
  return updateProduct(id, next);
};

/** Categories / Taxes */
export const listCategories = async () => {
  const r = await firstOkGET(CAT_PATHS);
  return unwrapRows(r);
};

export const listTaxes = async () => {
  const r = await firstOkGET(TAX_PATHS);
  return unwrapRows(r);
};

/** Images */
export const listProductImages = async (id) => {
  const r = await firstOkGET(IMG_LIST_PATHS(id));
  const rows = unwrapRows(r);
  return rows.map((x) => ({
    id: x.id,
    path: x.path ?? "",
    alt: x.alt ?? "",
    sort_order: asNumber(x.sort_order, 0),
    is_primary: !!x.is_primary,
    // Si tu backend expone URL, la usamos; si no, queda vacío
    url: x.url ?? x.image_url ?? x.path_url ?? "",
  }));
};

export const uploadProductImage = async (id, file, { alt = "", is_primary = false, sort_order = 0 } = {}) => {
  const fd = new FormData();
  fd.append("image", file);
  if (alt) fd.append("alt", alt);
  fd.append("is_primary", is_primary ? "1" : "0");
  fd.append("sort_order", String(sort_order ?? 0));

  const r = await firstOkPOST(IMG_LIST_PATHS(id), fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrapObj(r);
};

export const setProductImagePrimary = async (id, imageId) => {
  const r = await firstOkPOST(IMG_PRIMARY_PATHS(id, imageId));
  return unwrapObj(r);
};

export const deleteProductImage = async (id, imageId) => {
  const r = await firstOkDELETE(IMG_DELETE_PATHS(id, imageId));
  return unwrapObj(r);
};