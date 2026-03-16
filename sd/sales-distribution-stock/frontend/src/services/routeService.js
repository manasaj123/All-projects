// frontend/src/services/routeService.js
import api from './api';

export const getRoutes = () => api.get('/routes');
export const getDeletedRoutes = () => api.get('/routes/deleted');
export const getRouteById = id => api.get(`/routes/${id}`);
export const createRoute = data => api.post('/routes', data);
export const updateRoute = (id, data) => api.put(`/routes/${id}`, data);
export const softDeleteRoute = id => api.delete(`/routes/${id}`);
export const restoreRoute = id => api.put(`/routes/${id}/restore`);
