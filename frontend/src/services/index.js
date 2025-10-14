// 📁 src/services/index.js
import authService from "./authService";

export * as Customers from "./customerService";
export * as Products from "./productService";
export * as Catalog from "./catalogService";
export * as Employees from "./employeeService";
export * as Roles from "./roleService";
export * as Tasks from "./taskService";
export * as Documents from "./documentService";
export * as Tax from "./taxService";
export * as Geo from "./geoService";
export * as Users from "./userService";
export * as Sales from "./salesService";
export * as Invoices from "./invoiceService";
export * as Vendors from "./vendorService";
export * as Companies from "./companyService";

// 🔹 Solo esta definición de Auth (no la export * as Auth ...)
export const Auth = {
  login: (email, password) => authService.login({ email, password }),
  register: (name, email, password, password_confirmation) =>
    authService.register({ name, email, password, password_confirmation }),
  me: () => authService.me(),
  logout: () => authService.logout(),
};
