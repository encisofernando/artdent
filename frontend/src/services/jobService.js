import api from "./api";

const BASE = "/jobs";

export const getJobs = async (params = {}) => {
  const res = await api.get(BASE, { params });
  return res.data;
};

export const getJobById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createJob = async (data) => {
  const res = await api.post(BASE, data);
  return res.data;
};

export const updateJob = async (id, data) => {
  const res = await api.put(`${BASE}/${id}`, data);
  return res.data;
};

export const deleteJob = async (id) => {
  await api.delete(`${BASE}/${id}`);
  return true;
};