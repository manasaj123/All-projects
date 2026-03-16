// frontend/src/services/salesOrderService.js
import api from './api';

export const getSalesOrders = () => api.get('/sales-orders');
export const getDeletedSalesOrders = () => api.get('/sales-orders/deleted');
export const getSalesOrderById = id => api.get(`/sales-orders/${id}`);
export const createSalesOrder = data => api.post('/sales-orders', data);
export const updateSalesOrder = (id, data) =>
  api.put(`/sales-orders/${id}`, data);
export const softDeleteSalesOrder = id =>
  api.delete(`/sales-orders/${id}`);
export const restoreSalesOrder = id =>
  api.put(`/sales-orders/${id}/restore`);

// helpers
export const getCustomers = () => api.get('/customers');
export const getInquiries = () => api.get('/inquiries');
export const getQuotations = () => api.get('/quotations');
export const getMaterials = () => api.get('/materials');
