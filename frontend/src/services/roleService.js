// 📁 src/services/roleService.js
import api from "./api";
import { unwrap } from "./utils";

export const listRoles = async () => unwrap(await api.get("/roles"));

export const assignPermissions = async (roleId, taskIds = []) =>
  unwrap(await api.post(`/roles/${roleId}/permissions`, { task_ids: taskIds }));

// Bulk helper: { [roleId]: [taskId, ...], ... }
export const assignPermissionsBulk = async (map = {}) => {
  const results = {};
  for (const [roleId, arr] of Object.entries(map)) {
    results[roleId] = await assignPermissions(roleId, arr);
  }
  return results;
};
