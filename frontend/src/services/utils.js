// Acepta tanto una Promise (axios) como una respuesta ya resuelta.
// Evita errores: "p.then is not a function" cuando se usa unwrap(await api.get(...)).
export const unwrap = (pOrResponse) => {
  if (pOrResponse && typeof pOrResponse.then === "function") {
    return pOrResponse.then((r) => r?.data);
  }

  // axios resuelto: { data, status, headers, ... }
  if (pOrResponse && typeof pOrResponse === "object" && "data" in pOrResponse) {
    return pOrResponse.data;
  }

  return pOrResponse;
};

export const toQueryString = (obj = {}) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.append(k, v);
  });
  return params.toString();
};
