// frontend/src/services/conditionService.js
import api from './api';

export const getConditions = () => api.get('/conditions');
export const getDeletedConditions = () => api.get('/conditions/deleted');
export const getConditionById = id => api.get(`/conditions/${id}`);
export const createCondition = data => api.post('/conditions', data);
export const updateCondition = (id, data) => api.put(`/conditions/${id}`, data);
export const softDeleteCondition = id => api.delete(`/conditions/${id}`);
export const restoreCondition = id => api.put(`/conditions/${id}/restore`);

// helpers
export const getCustomers = () => api.get('/customers');
export const getMaterials = () => api.get('/materials');
