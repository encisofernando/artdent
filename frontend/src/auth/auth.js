// auth.js
import { jwtDecode } from 'jwt-decode';

// Helpers
const getToken = () => localStorage.getItem('token');
const safeDecode = (token) => {
  if (!token) return null;
  try { return jwtDecode(token); } catch { return null; }
};

/**
 * Obtener el ID base del token JWT almacenado en localStorage.
 * @returns {string|null}
 */
export const getIdBaseFromToken = () => (
  safeDecode(getToken())?.idBase ?? null
);

/**
 * Verifica si hay un token JWT válido en el localStorage.
 * @returns {boolean}
 */
export const isTokenValid = () => {
  const decoded = safeDecode(getToken());
  if (!decoded || typeof decoded.exp !== 'number') return false;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp > now;
};

/**
 * Obtener el idUsuario del token JWT.
 * @returns {string|null}
 */
export const getUserIdFromToken = () => (
  safeDecode(getToken())?.idUsuario ?? null
);

/**
 * Obtener el idEmpleado del token JWT.
 * @returns {string|null}
 */
export const getIdEmpleadoFromToken = () => (
  safeDecode(getToken())?.idEmpleado ?? null
);

/**
 * Obtener el idRol del token JWT.
 * @returns {string|null}
 */
export const getIdRolFromToken = () => (
  safeDecode(getToken())?.idRol ?? null
);

/**
 * Almacenar permisos en localStorage.
 * @param {Array} permissions
 */
export const storeUserPermissions = (permissions) => {
  if (permissions) {
    localStorage.setItem('userPermissions', JSON.stringify(permissions));
  }
};

/**
 * Obtener permisos del usuario desde localStorage.
 * @returns {Array|null}
 */
export const getUserPermissions = () => {
  const permissions = localStorage.getItem('userPermissions');
  try {
    return permissions ? JSON.parse(permissions) : null;
  } catch {
    return null;
  }
};
