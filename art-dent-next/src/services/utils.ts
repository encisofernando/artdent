import type { AxiosResponse } from "axios";

type MaybePromise<T> = T | Promise<T>;

/** Acepta tanto una Promise<AxiosResponse> como una respuesta ya resuelta. */
export const unwrap = <T = unknown>(
  pOrResponse: MaybePromise<AxiosResponse<T>> | AxiosResponse<T>
): Promise<T> => {
  if (pOrResponse && typeof (pOrResponse as Promise<unknown>).then === "function") {
    return (pOrResponse as Promise<AxiosResponse<T>>).then((r) => r?.data);
  }
  const res = pOrResponse as AxiosResponse<T>;
  if (res && typeof res === "object" && "data" in res) {
    return Promise.resolve(res.data);
  }
  return Promise.resolve(pOrResponse as unknown as T);
};

export const toQueryString = (obj: Record<string, unknown> = {}): string => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
  });
  return params.toString();
};
