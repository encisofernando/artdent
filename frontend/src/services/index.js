// 📁 src/services/index.js
export * as Auth from "./authService"; // si no existe aún en tu proyecto, puedes quitar esta línea
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
export * as Sales from "./salesService";       // si ya lo tenés
export * as Invoices from "./invoiceService";  // si ya lo tenés
export * as Vendors from "./vendorService";    // <--- estaba faltando
export * as Companies from "./companyService"; // <--- nuevo

