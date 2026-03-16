// frontend/src/services/pickingService.js
import api from './api';

export const getPickings = () => api.get('/pickings');
export const getDeletedPickings = () => api.get('/pickings/deleted');
export const getPickingById = id => api.get(`/pickings/${id}`);
export const createPicking = data => api.post('/pickings', data);
export const updatePicking = (id, data) => api.put(`/pickings/${id}`, data);
export const softDeletePicking = id => api.delete(`/pickings/${id}`);
export const restorePicking = id => api.put(`/pickings/${id}/restore`);

// helpers
export const getDeliveries = () => api.get('/deliveries');
