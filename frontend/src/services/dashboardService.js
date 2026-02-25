import api from './api'; // Usar tu instancia de axios configurada

/**
 * Obtener estadísticas del dashboard
 * @param {Object} params - { period, start_date, end_date }
 * @returns {Promise}
 */
export const getStats = async (params = {}) => {
  try {
    const response = await api.get('/dashboard/stats', { params });
    return response.data;
  } catch (error) {
    console.error('Dashboard service error:', error);
    throw error;
  }
};

/**
 * Obtener datos para gráficos
 * @param {string} type - revenue, sales, products, geography
 * @param {string} period - today, week, month, year
 * @returns {Promise}
 */
export const getChartData = async (type, params = {}) => {
  try {
    const response = await api.get('/dashboard/charts', {
      params: { type, ...params }, // period, start_date, end_date
    });
    return response.data;
  } catch (error) {
    console.error('Dashboard service error:', error);
    throw error;
  }
};

/**
 * Obtener transacciones recientes
 * @param {number} limit - Cantidad de transacciones
 * @returns {Promise}
 */
export const getRecentTransactions = async (limit = 10) => {
  try {
    const response = await api.get('/dashboard/recent-transactions', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Dashboard service error:', error);
    throw error;
  }
};

/**
 * Exportar dashboard a PDF
 * @param {Object} params - { period, start_date, end_date }
 * @returns {Promise}
 */
export const exportPDF = async (params = {}) => {
  try {
    const response = await api.get('/dashboard/export/pdf', {
      params,
      responseType: 'blob',
    });
    
    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dashboard_${new Date().getTime()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Dashboard service error:', error);
    throw error;
  }
};

/**
 * Guardar configuración de widgets del dashboard
 * @param {Array} layout - Configuración del layout
 * @returns {Promise}
 */
export const saveWidgetLayout = async (layout) => {
  try {
    const response = await api.post('/dashboard/layout', { layout });
    return response.data;
  } catch (error) {
    console.error('Dashboard service error:', error);
    throw error;
  }
};

/**
 * Obtener configuración de widgets del dashboard
 * @returns {Promise}
 */
export const getWidgetLayout = async () => {
  try {
    const response = await api.get('/dashboard/layout');
    return response.data;
  } catch (error) {
    // Si no existe configuración, retornar null
    return null;
  }
};

export default {
  getStats,
  getChartData,
  getRecentTransactions,
  exportPDF,
  saveWidgetLayout,
  getWidgetLayout,
};