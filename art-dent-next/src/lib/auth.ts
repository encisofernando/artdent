import { jwtDecode } from "jwt-decode";

interface ArtdentJwt {
  exp?:        number;
  idBase?:     string | number;
  idUsuario?:  string | number;
  idEmpleado?: string | number;
  idRol?:      string | number;
}

const getToken = (): string | null =>
  typeof window !== "undefined"
    ? localStorage.getItem("artdent_token") || localStorage.getItem("token")
    : null;

const safeDecode = (token: string | null): ArtdentJwt | null => {
  if (!token) return null;
  try {
    return jwtDecode<ArtdentJwt>(token);
  } catch {
    return null;
  }
};

export const isTokenValid = (): boolean => {
  const decoded = safeDecode(getToken());
  if (!decoded || typeof decoded.exp !== "number") return false;
  return decoded.exp > Math.floor(Date.now() / 1000);
};

export const getIdBaseFromToken     = () => safeDecode(getToken())?.idBase     ?? null;
export const getUserIdFromToken     = () => safeDecode(getToken())?.idUsuario   ?? null;
export const getIdEmpleadoFromToken = () => safeDecode(getToken())?.idEmpleado  ?? null;
export const getIdRolFromToken      = () => safeDecode(getToken())?.idRol       ?? null;

export const storeUserPermissions = (permissions: unknown[]): void => {
  if (typeof window !== "undefined" && permissions) {
    localStorage.setItem("userPermissions", JSON.stringify(permissions));
  }
};

export const getUserPermissions = (): unknown[] | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("userPermissions");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearAuth = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("artdent_token");
  localStorage.removeItem("userPermissions");
  localStorage.removeItem("user");
};
