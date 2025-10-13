// 📁 src/services/utils.js
export const unwrap = (r) => (r?.data?.data !== undefined ? r.data.data : r?.data ?? r);
export const toQueryString = (obj = {}) =>
  Object.entries(obj)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
