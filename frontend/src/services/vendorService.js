// 📁 src/services/vendorService.js
import api from "./api";
import { unwrap, toQueryString } from "./utils";

const toUI = (v) => ({
  idProveedor: v.id,
  name: v.name,
  tax_id: v.tax_id ?? "",
  email: v.email ?? "",
  phone: v.phone ?? "",
  address: v.address ?? "",
  city: v.city ?? "",
  state: v.state ?? "",
  zip: v.zip ?? "",
  is_active: !!v.is_active,
});

const toBackend = (payload) => {
  const body = payload instanceof FormData
    ? Object.fromEntries(payload.entries())
    : payload;

  return {
    name: body.name ?? body.RazonSocial ?? body.Nombre ?? "",
    tax_id: body.tax_id ?? body.CUIT ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
    address: body.address ?? "",
    city: body.city ?? "",
    state: body.state ?? "",
    zip: body.zip ?? "",
    is_active: body.is_active != null ? (body.is_active ? 1 : 0) : 1,
  };
};

export const listVendors = async (params = {}) => {
  const qs = toQueryString(params);
  const data = unwrap(await api.get(`/vendors${qs ? `?${qs}` : ""}`));
  return (data || []).map(toUI);
};

export const getVendor = async (id) => toUI(unwrap(await api.get(`/vendors/${id}`)));

export const createVendor = async (payload) =>
  toUI(unwrap(await api.post("/vendors", toBackend(payload))));

export const updateVendor = async (id, payload) =>
  toUI(unwrap(await api.put(`/vendors/${id}`, toBackend(payload))));

export const deleteVendor = async (id) =>
  unwrap(await api.delete(`/vendors/${id}`));
