// src/services/catalogService.js
import api from "./api";

// helpers de fallback
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
const rows = (res) => {
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  return [];
};

// ===== CATEGORÍAS =====
const catToUI = (c = {}) => ({
  idCategoria: c.idCategoria ?? c.id ?? null,
  Nombre: c.Nombre ?? c.name ?? "",
  parent_id: c.parent_id ?? null,
  Activo: c.Activo != null ? Number(c.Activo) === 1 : (c.deleted_at ? 0 : 1),
});
export const listCategories = async (params = {}) => {
  const r = await firstOkGET(
    ["api/categories", "/categories"],
    params
  );
  return rows(r).map(catToUI);
};

// ===== IVA / TAXES =====
const ivaToUI = (t = {}) => ({
  idIva: t.idIva ?? t.id ?? null,
  Nombre: t.Nombre ?? t.name ?? "IVA",
  Porcentaje: Number(t.Porcentaje ?? t.rate ?? 0),
  is_default: !!(t.is_default ?? t.default),
});
export const listTaxes = async () => {
  const r = await firstOkGET(
    ["api/taxes", "/taxes"]
  );
  return rows(r).map(ivaToUI);
};

// ===== PROMOCIONES =====
const promoToUI = (p = {}) => ({
  idPromocionCantidad: p.idPromocionCantidad ?? p.id ?? null,
  Nombre: p.Nombre ?? p.name ?? p.title ?? "Promoción",
});
export const listPromotions = async () => {
  try {
    const r = await firstOkGET(
      ["api/promotions", "/promotions"]
    );
    return rows(r).map(promoToUI);
  } catch {
    return [];
  }
};

// ===== PROVEEDORES / VENDORS =====
const provToUI = (v = {}) => ({
  idProveedor: v.idProveedor ?? v.id ?? null,
  RazonSocial: v.RazonSocial ?? v.name ?? "",
  CUIT: v.CUIT ?? v.tax_id ?? null,
  email: v.email ?? null,
});
export const listSuppliers = async () => {
  const r = await firstOkGET(
    ["api/vendors", "/vendors"]
  );
  return rows(r).map(provToUI);
};
