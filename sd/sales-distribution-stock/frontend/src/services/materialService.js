// frontend/src/services/materialService.js
import api from './api';

export const getMaterials = () => api.get('/materials');
export const getDeletedMaterials = () => api.get('/materials/deleted');
export const getMaterialById = id => api.get(`/materials/${id}`);
export const createMaterial = data => api.post('/materials', data);
export const updateMaterial = (id, data) => api.put(`/materials/${id}`, data);
export const softDeleteMaterial = id => api.delete(`/materials/${id}`);
export const restoreMaterial = id => api.put(`/materials/${id}/restore`);
