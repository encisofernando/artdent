import Auth from "./authService";
import Companies from "./companies";
import Dashboard from "./dashboard";
import Products from "./product";

export { Auth, Companies, Dashboard, Products };

// Si además querés exports tipo “* as ...”
export * as AuthService from "./authService";
export * as CompaniesService from "./companies";
export * as DashboardService from "./dashboard";
export * as ProductService from "./product";
export * as Customers from "./customers";