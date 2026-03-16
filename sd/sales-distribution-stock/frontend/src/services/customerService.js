// frontend/src/services/customerService.js
import api from './api';

export const getCustomers = () => api.get('/customers');
export const getDeletedCustomers = () => api.get('/customers/deleted');
export const getCustomerById = id => api.get(`/customers/${id}`);
export const createCustomer = data => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const softDeleteCustomer = id => api.delete(`/customers/${id}`);
export const restoreCustomer = id => api.put(`/customers/${id}/restore`);
