// src/auth/offline.js
import { storeUserPermissions } from "./auth";

export const DEFAULT_USER = {
  idUsuario: "u-0000",
  idEmpleado: "emp-0000",
  idBase: "base-0001",
  idRol: "admin",
  email: "demo@artdent.com.ar",
  password: "artdent123",
  nombre: "Usuario Demo",
  permisos: [
    "dashboard.view",
    "clientes.view",
    "articulos.view",
    "categorias.view",
    "proveedores.view",
    "facturacion.view",
    "team.view",
    "settings.view",
  ],
};

const b64url = (str) =>
  btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

export const createOfflineToken = (user, ttlSec = 60 * 60 * 24 * 30) => {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: "ARTDENT_OFFLINE",
    iat: now,
    exp: now + ttlSec,          // <- exp presente para pasar isTokenValid
    idBase: user.idBase,
    idEmpleado: user.idEmpleado,
    idUsuario: user.idUsuario,
    idRol: user.idRol,
    email: user.email,
    nombre: user.nombre,
    offline: true,
  };
  return `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}.offline`;
};

export const loginOffline = async (email, password) => {
  if (
    email?.toLowerCase() === DEFAULT_USER.email.toLowerCase() &&
    password === DEFAULT_USER.password
  ) {
    const token = createOfflineToken(DEFAULT_USER);
    localStorage.setItem("token", token);
    localStorage.setItem("idBase", DEFAULT_USER.idBase);
    localStorage.setItem("idEmpleado", DEFAULT_USER.idEmpleado);
    storeUserPermissions(DEFAULT_USER.permisos);
    return { token, idBase: DEFAULT_USER.idBase, idEmpleado: DEFAULT_USER.idEmpleado };
  }
  throw new Error("Credenciales offline inválidas");
};
