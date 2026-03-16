// frontend/src/services/itemCategoryService.js
import api from './api';

export const getItemCategories = () => api.get('/item-categories');
export const getDeletedItemCategories = () =>
  api.get('/item-categories/deleted');
export const getItemCategoryById = id => api.get(`/item-categories/${id}`);
export const createItemCategory = data => api.post('/item-categories', data);
export const updateItemCategory = (id, data) =>
  api.put(`/item-categories/${id}`, data);
export const softDeleteItemCategory = id =>
  api.delete(`/item-categories/${id}`);
export const restoreItemCategory = id =>
  api.put(`/item-categories/${id}/restore`);
