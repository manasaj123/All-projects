// frontend/src/services/deliveryService.js
import api from './api';

export const getDeliveries = () => api.get('/deliveries');
export const getDeletedDeliveries = () => api.get('/deliveries/deleted');
export const getDeliveryById = id => api.get(`/deliveries/${id}`);
export const createDelivery = data => api.post('/deliveries', data);
export const updateDelivery = (id, data) => api.put(`/deliveries/${id}`, data);
export const softDeleteDelivery = id => api.delete(`/deliveries/${id}`);
export const restoreDelivery = id => api.put(`/deliveries/${id}/restore`);

// helpers
export const getSalesOrders = () => api.get('/sales-orders');
export const getCustomers = () => api.get('/customers');
