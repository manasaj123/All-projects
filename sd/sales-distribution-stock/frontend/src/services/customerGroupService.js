// frontend/src/services/customerGroupService.js
import api from './api';

export const getCustomerGroups = () => api.get('/customer-groups');
export const getDeletedCustomerGroups = () => api.get('/customer-groups/deleted');
export const getCustomerGroupById = id => api.get(`/customer-groups/${id}`);
export const createCustomerGroup = data => api.post('/customer-groups', data);
export const updateCustomerGroup = (id, data) =>
  api.put(`/customer-groups/${id}`, data);
export const softDeleteCustomerGroup = id =>
  api.delete(`/customer-groups/${id}`);
export const restoreCustomerGroup = id =>
  api.put(`/customer-groups/${id}/restore`);
