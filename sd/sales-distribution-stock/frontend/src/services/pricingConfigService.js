// frontend/src/services/pricingConfigService.js
import api from './api';

export const getPricingConfigs = () => api.get('/pricing');
export const getDeletedPricingConfigs = () => api.get('/pricing/deleted');
export const getPricingConfigById = id => api.get(`/pricing/${id}`);
export const createPricingConfig = data => api.post('/pricing', data);
export const updatePricingConfig = (id, data) =>
  api.put(`/pricing/${id}`, data);
export const softDeletePricingConfig = id => api.delete(`/pricing/${id}`);
export const restorePricingConfig = id => api.put(`/pricing/${id}/restore`);
