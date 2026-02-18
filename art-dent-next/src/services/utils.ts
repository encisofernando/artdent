import type { AxiosResponse } from "axios";

// Acepta tanto una Promise (axios) como una respuesta ya resuelta.
// Evita errores: "p.then is not a function" cuando se usa unwrap(await api.get(...)).
export const unwrap = async <T = unknown>(
  pOrResponse: Promise<AxiosResponse<T>> | AxiosResponse<T> | T
): Promise<T> => {
  // Promise
  if (pOrResponse && typeof (pOrResponse as any).then === "function") {
    const r = await (pOrResponse as Promise<AxiosResponse<T>>);
    return r?.data as T;
  }

  // axios resuelto: { data, status, headers, ... }
  if (
    pOrResponse &&
    typeof pOrResponse === "object" &&
    pOrResponse !== null &&
    "data" in (pOrResponse as any)
  ) {
    return (pOrResponse as AxiosResponse<T>).data as T;
  }

  return pOrResponse as T;
};

export const toQueryString = (obj: Record<string, any> = {}) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
  });
  return params.toString();
};
