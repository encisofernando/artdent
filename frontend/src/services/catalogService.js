// 📁 src/services/catalogService.js
import api from "./api";
import { unwrap, toQueryString } from "./utils";

/** ===================
 *     CATEGORIES
 *  ===================
 * Tabla real: categories (id, company_id, name, parent_id, timestamps, deleted_at)
 * UI mapeada: { idCategoria, Nombre, Activo, parent_id }
 */
const catToUI = (c) => ({
  idCategoria: c.id,
  Nombre: c.name,
  parent_id: c.parent_id ?? null,
  Activo: c.deleted_at ? 0 : 1,
  deleted_at: c.deleted_at ?? null,
});

const catToBackend = (payload) => ({
  name: payload.Nombre ?? payload.name,
  parent_id: payload.parent_id ?? null,
});

export const listCategories = async (params = {}) => {
  const qs = toQueryString(params);
  const data = unwrap(await api.get(`/categories${qs ? `?${qs}` : ""}`));
  return (data || []).map(catToUI);
};

export const getCategory = async (id) => catToUI(unwrap(await api.get(`/categories/${id}`)));

export const createCategory = async (payload) =>
  catToUI(unwrap(await api.post("/categories", catToBackend(payload))));

export const updateCategory = async (id, payload) =>
  catToUI(unwrap(await api.put(`/categories/${id}`, catToBackend(payload))));

export const deleteCategory = async (id) => unwrap(await api.delete(`/categories/${id}`));

/**
 * Toggle: intenta un endpoint dedicado /categories/{id}/toggle-active.
 * Si no existe: si está activo => DELETE (soft delete).
 * Si está inactivo => intenta restaurar en /categories/{id}/restore.
 */
export const toggleCategory = async (cat) => {
  try {
    return catToUI(unwrap(await api.post(`/categories/${cat.idCategoria}/toggle-active`)));
  } catch (e) {
    if (cat.Activo) {
      await api.delete(`/categories/${cat.idCategoria}`);
      return { ...cat, Activo: 0, deleted_at: new Date().toISOString() };
    } else {
      try {
        return catToUI(unwrap(await api.post(`/categories/${cat.idCategoria}/restore`)));
      } catch {
        // Fallback final: actualizar nombre sin cambios (siempre que backend ignore deleted_at)
        const refreshed = unwrap(await api.get(`/categories/${cat.idCategoria}`));
        return catToUI(refreshed);
      }
    }
  }
};

/** ===================
 *     TAXES / IVA
 *  ===================
 */
export const listTaxes = async () => {
  const data = unwrap(await api.get("/taxes"));
  return (data || []).map((t) => ({
    idIva: t.id,
    Nombre: t.name,
    Porcentaje: Number(t.rate ?? 0),
    is_default: !!t.is_default,
  }));
};

/** ===================
 *   PROMOTIONS (safe)
 *  ===================
 */
export const listPromotions = async () => {
  try {
    const data = unwrap(await api.get("/promotions"));
    return (data || []).map((p) => ({ idPromocionCantidad: p.id, Nombre: p.name ?? p.title ?? "Promoción" }));
  } catch (e) {
    return [];
  }
};

/** ===================
 *     SUPPLIERS
 *  ===================
 */
export const listSuppliers = async () => {
  const data = unwrap(await api.get("/vendors"));
  return (data || []).map((v) => ({
    idProveedor: v.id,
    RazonSocial: v.name,
    CUIT: v.tax_id ?? null,
    email: v.email ?? null,
  }));
};
