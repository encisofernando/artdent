import api from "./api";

export const CollaboratorReceipts = {
  generate: (payload) => api.post("/collaborator-receipts/generate", payload).then(r => r.data),
  get: (id) => api.get(`/collaborator-receipts/${id}`).then(r => r.data),
};
