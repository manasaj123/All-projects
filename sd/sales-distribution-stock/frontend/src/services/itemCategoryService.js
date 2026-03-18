// frontend/src/services/itemCategoryService.js
import api from './api';

export const getItemCategories = () =>
  api.get('/item-categories-config');

export const getDeletedItemCategories = () =>
  api.get('/item-categories-config/deleted');

export const getItemCategoryById = id =>
  api.get(`/item-categories-config/${id}`);

export const createItemCategory = data =>
  api.post('/item-categories-config', data);

export const updateItemCategory = (id, data) =>
  api.put(`/item-categories-config/${id}`, data);

export const softDeleteItemCategory = id =>
  api.delete(`/item-categories-config/${id}`);

export const restoreItemCategory = id =>
  api.put(`/item-categories-config/${id}/restore`);