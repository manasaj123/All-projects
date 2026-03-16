// frontend/src/services/shippingService.js
import api from './api';

export const getShippingConfigs = () => api.get('/shipping');
export const getDeletedShippingConfigs = () => api.get('/shipping/deleted');
export const getShippingConfigById = id => api.get(`/shipping/${id}`);
export const createShippingConfig = data => api.post('/shipping', data);
export const updateShippingConfig = (id, data) =>
  api.put(`/shipping/${id}`, data);
export const softDeleteShippingConfig = id => api.delete(`/shipping/${id}`);
export const restoreShippingConfig = id => api.put(`/shipping/${id}/restore`);
