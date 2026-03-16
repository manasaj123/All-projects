// frontend/src/services/creditService.js
import api from './api';

export const getCredits = () => api.get('/credits');
export const getDeletedCredits = () => api.get('/credits/deleted');
export const getCreditById = id => api.get(`/credits/${id}`);
export const createCredit = data => api.post('/credits', data);
export const updateCredit = (id, data) => api.put(`/credits/${id}`, data);
export const softDeleteCredit = id => api.delete(`/credits/${id}`);
export const restoreCredit = id => api.put(`/credits/${id}/restore`);

// helpers
export const getCustomers = () => api.get('/customers');
