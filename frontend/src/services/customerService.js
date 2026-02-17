// 📁 src/services/customerService.js
// Wrapper para compatibilidad con imports existentes.

import * as Customers from "./customers";

export const listCustomers = Customers.list;
export const getCustomer = Customers.get;
export const createCustomer = Customers.create;
export const updateCustomer = Customers.update;
export const deleteCustomer = Customers.remove;

export default {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
