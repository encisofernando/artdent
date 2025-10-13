// 📁 src/services/productService.js
import api from "./api";
import { unwrap } from "./utils";

/**
 * Mappers entre tu UI y el backend (tabla products)
 */
const toUI = (p) => ({
  idArticulo: p.id,
  id: p.id,                      // por si alguna grilla usa id
  Nombre: p.name,
  Descripcion: p.description ?? "",
  Codigo: p.sku ?? "",
  CodigoBarra: p.barcode ?? "",
  PrecioPublico: Number(p.price ?? 0),
  Costo: Number(p.cost ?? 0),
  Iva: p.tax_rate ?? 0,
  idCategoria: p.category_id ?? null,
  Activo: !!p.is_active,
  Stock: Number(p.stock ?? 0),      // si el backend expone algún agregado; si no, queda en 0
  StockMin: Number(p.min_stock ?? 0),
  track_stock: !!p.track_stock,
  tax_id: p.tax_id ?? null,
});

const toBackend = (payload) => {
  // payload puede venir como objeto o FormData con nombres de la UI
  const obj = payload instanceof FormData
    ? Object.fromEntries(payload.entries())
    : payload;

  const fd = new FormData();

  // Campos mapeados al esquema backend
  if (obj.Nombre != null) fd.append("name", obj.Nombre);
  if (obj.Descripcion != null) fd.append("description", obj.Descripcion);
  if (obj.Codigo != null) fd.append("sku", obj.Codigo);
  if (obj.CodigoBarra != null) fd.append("barcode", obj.CodigoBarra);
  if (obj.PrecioPublico != null) fd.append("price", obj.PrecioPublico);
  if (obj.Costo != null) fd.append("cost", obj.Costo);

  // IVA: priorizamos tax_id si existe, sino tax_rate (porcentaje)
  if (obj.idIva != null) fd.append("tax_id", obj.idIva);
  else if (obj.Iva != null) fd.append("tax_rate", obj.Iva);

  if (obj.idCategoria != null) fd.append("category_id", obj.idCategoria);

  // Activo
  if (obj.activo != null) fd.append("is_active", Number(obj.activo) ? 1 : 0);

  // Stock
  if (obj.NoAplicaStock != null) {
    fd.append("track_stock", Number(obj.NoAplicaStock) ? 0 : 1);
  }
  if (obj.StockMin != null) fd.append("min_stock", obj.StockMin);

  // Imagen si la pasaron como 'Imagen' o 'image'
  if (obj.Imagen instanceof File) fd.append("image", obj.Imagen);
  else if (obj.image instanceof File) fd.append("image", obj.image);

  // Permitir enviar extras que ya vengan en backend-form
  // (si payload era FormData con claves backend, las mantenemos)
  if (payload instanceof FormData) {
    for (const [k, v] of payload.entries()) {
      if (!fd.has(k)) fd.append(k, v);
    }
  }

  return fd;
};

export const listProducts = async (params = {}) =>
  unwrap(await api.get("/products", { params })).map(toUI);

export const getProduct = async (id) =>
  toUI(unwrap(await api.get(`/products/${id}`)));

export const createProduct = async (payload) =>
  toUI(unwrap(await api.post("/products", toBackend(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  })));

export const updateProduct = async (id, payload) =>
  toUI(unwrap(await api.post(`/products/${id}?_method=PUT`, toBackend(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  })));

export const deleteProduct = async (id) =>
  unwrap(await api.delete(`/products/${id}`));

// Toggle de activo: intenta endpoint dedicado y si no existe, degrada a update.
export const toggleProductActive = async (id) => {
  try {
    return toUI(unwrap(await api.post(`/products/${id}/toggle-active`)));
  } catch (e) {
    // fallback: leo y actualizo
    const current = unwrap(await api.get(`/products/${id}`));
    const next = { ...current, is_active: current?.is_active ? 0 : 1 };
    return toUI(unwrap(await api.put(`/products/${id}`, next)));
  }
};
