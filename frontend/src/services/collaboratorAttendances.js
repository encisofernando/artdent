import api from "./api";

export const CollaboratorAttendances = {
  list: (params = {}) => api.get("/collaborator-attendances", { params }).then(r => r.data),
  create: (payload) => api.post("/collaborator-attendances", payload).then(r => r.data),
  update: (id, payload) => api.put(`/collaborator-attendances/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/collaborator-attendances/${id}`).then(r => r.data),
};
