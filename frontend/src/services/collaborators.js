import api from "./api";

export const Collaborators = {
  list: (params = {}) => api.get("/collaborators", { params }).then(r => r.data),
  get: (id) => api.get(`/collaborators/${id}`).then(r => r.data),
  create: (payload) => api.post("/collaborators", payload).then(r => r.data),
  update: (id, payload) => api.put(`/collaborators/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/collaborators/${id}`).then(r => r.data),
};
