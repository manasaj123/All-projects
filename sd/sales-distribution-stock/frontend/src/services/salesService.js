// frontend/src/services/salesService.js
import api from './api';

// Material Sales View (MM for Sales View)
export const getSalesViews = () => api.get('/material-sales');
export const getDeletedSalesViews = () => api.get('/material-sales/deleted');
export const getSalesViewById = id => api.get(`/material-sales/${id}`);
export const createSalesView = data => api.post('/material-sales', data);
export const updateSalesView = (id, data) => api.put(`/material-sales/${id}`, data);
export const softDeleteSalesView = id => api.delete(`/material-sales/${id}`);
export const restoreSalesView = id => api.put(`/material-sales/${id}/restore`);

// helper to get materials for dropdown
export const getMaterials = () => api.get('/materials');
