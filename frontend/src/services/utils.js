export const unwrap = (p) => p.then((r) => r.data);

export const toQueryString = (obj = {}) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.append(k, v);
  });
  return params.toString();
};
