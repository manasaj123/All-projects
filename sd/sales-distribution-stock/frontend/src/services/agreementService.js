// frontend/src/services/agreementService.js
import api from './api';

export const getAgreements = () => api.get('/agreements');
export const getDeletedAgreements = () => api.get('/agreements/deleted');
export const getAgreementById = id => api.get(`/agreements/${id}`);
export const createAgreement = data => api.post('/agreements', data);
export const updateAgreement = (id, data) => api.put(`/agreements/${id}`, data);
export const softDeleteAgreement = id => api.delete(`/agreements/${id}`);
export const restoreAgreement = id => api.put(`/agreements/${id}/restore`);
