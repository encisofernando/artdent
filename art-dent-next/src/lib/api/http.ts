import { ApiError } from "./errors";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type HttpOptions = {
  method?: HttpMethod;
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
  /**
   * Por defecto espera JSON. Si pedís "blob", retorna Blob.
   */
  responseType?: "json" | "blob" | "text";
};

function baseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || "https://api.artdent.com.ar/api";
  return url.replace(/\/+$/, "");
}

function toQueryString(query?: Record<string, unknown>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    params.append(k, String(v));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("artdent_token") || localStorage.getItem("token");
  } catch {
    return null;
  }
}

export async function http<T>(
  path: string,
  opts: HttpOptions = {}
): Promise<T> {
  const url = `${baseUrl()}${path.startsWith("/") ? "" : "/"}${path}${toQueryString(opts.query)}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(opts.headers || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  // Manejo de respuesta según responseType
  const rt = opts.responseType ?? "json";

  const parseBody = async () => {
    if (rt === "blob") return (await res.blob()) as unknown;
    if (rt === "text") return (await res.text()) as unknown;

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return (await res.json()) as unknown;
    // fallback
    return (await res.text()) as unknown;
  };

  const data = await parseBody().catch(() => null);

  if (!res.ok) {
    throw new ApiError(`API ${res.status} en ${path}`, res.status, data);
  }

  return data as T;
}
