// frontend/src/services/salesDocumentService.js
import api from './api';

export const getSalesDocuments = () => api.get('/sales-documents');
export const getDeletedSalesDocuments = () =>
  api.get('/sales-documents/deleted');
export const getSalesDocumentById = id =>
  api.get(`/sales-documents/${id}`);
export const createSalesDocument = data =>
  api.post('/sales-documents', data);
export const updateSalesDocument = (id, data) =>
  api.put(`/sales-documents/${id}`, data);
export const softDeleteSalesDocument = id =>
  api.delete(`/sales-documents/${id}`);
export const restoreSalesDocument = id =>
  api.put(`/sales-documents/${id}/restore`);
