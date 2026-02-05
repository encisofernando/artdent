import api from "./api";

export const CollaboratorReceipts = {
  generate: (payload, headers = {}) =>
    api
      .post("/collaborator-receipts/generate", payload, { headers })
      .then((r) => r.data),
  get: (id) => api.get(`/collaborator-receipts/${id}`).then(r => r.data),
};
