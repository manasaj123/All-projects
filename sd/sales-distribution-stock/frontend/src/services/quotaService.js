// frontend/src/services/quotaService.js
import api from './api';

export const getQuotas = () => api.get('/quotas');
export const getDeletedQuotas = () => api.get('/quotas/deleted');
export const getQuotaById = id => api.get(`/quotas/${id}`);
export const createQuota = data => api.post('/quotas', data);
export const updateQuota = (id, data) => api.put(`/quotas/${id}`, data);
export const softDeleteQuota = id => api.delete(`/quotas/${id}`);
export const restoreQuota = id => api.put(`/quotas/${id}/restore`);
