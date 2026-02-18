import api from "./api";
import type { AxiosError } from "axios";

export type DashboardStatsParams = {
  period?: string;
  start_date?: string;
  end_date?: string;
  [k: string]: unknown;
};

export type ChartType = "revenue" | "sales" | "products" | "geography" | string;

/**
 * Obtener estadísticas del dashboard
 * @param params - { period, start_date, end_date }
 */
export const getStats = async <T = unknown>(
  params: DashboardStatsParams = {}
): Promise<T> => {
  try {
    const response = await api.get<T>("/dashboard/stats", { params });
    return response.data;
  } catch (error) {
    console.error("Dashboard service error:", error);
    throw error;
  }
};

/**
 * Obtener datos para gráficos
 * @param type - revenue, sales, products, geography
 * @param period - today, week, month, year
 */
export const getChartData = async <T = unknown>(
  type: ChartType,
  period = "month"
): Promise<T> => {
  try {
    const response = await api.get<T>("/dashboard/charts", {
      params: { type, period },
    });
    return response.data;
  } catch (error) {
    console.error("Dashboard service error:", error);
    throw error;
  }
};

/**
 * Obtener transacciones recientes
 * @param limit - Cantidad de transacciones
 */
export const getRecentTransactions = async <T = unknown>(
  limit = 10
): Promise<T> => {
  try {
    const response = await api.get<T>("/dashboard/recent-transactions", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error("Dashboard service error:", error);
    throw error;
  }
};

/**
 * Exportar dashboard a PDF
 * Importante: en Next conviene devolver el Blob y que la UI decida descargar.
 */
export const exportPDF = async (params: DashboardStatsParams = {}): Promise<Blob> => {
  try {
    const response = await api.get<Blob>("/dashboard/export/pdf", {
      params,
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Dashboard service error:", error);
    throw error;
  }
};

/**
 * Guardar configuración de widgets del dashboard
 */
export const saveWidgetLayout = async <T = unknown>(
  layout: unknown[]
): Promise<T> => {
  try {
    const response = await api.post<T>("/dashboard/layout", { layout });
    return response.data;
  } catch (error) {
    console.error("Dashboard service error:", error);
    throw error;
  }
};

/**
 * Obtener configuración de widgets del dashboard
 * Si no existe configuración, retornar null
 */
export const getWidgetLayout = async <T = unknown>(): Promise<T | null> => {
  try {
    const response = await api.get<T>("/dashboard/layout");
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    // si no existe config o falla, null
    if (err?.response?.status === 404) return null;
    return null;
  }
};

const dashboardService = {
  getStats,
  getChartData,
  getRecentTransactions,
  exportPDF,
  saveWidgetLayout,
  getWidgetLayout,
};

export default dashboardService;
