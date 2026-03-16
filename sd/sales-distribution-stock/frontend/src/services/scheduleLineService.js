// frontend/src/services/scheduleLineService.js
import api from './api';

export const getScheduleLines = () => api.get('/schedule-lines');
export const getDeletedScheduleLines = () => api.get('/schedule-lines/deleted');
export const getScheduleLineById = id => api.get(`/schedule-lines/${id}`);
export const createScheduleLine = data => api.post('/schedule-lines', data);
export const updateScheduleLine = (id, data) =>
  api.put(`/schedule-lines/${id}`, data);
export const softDeleteScheduleLine = id =>
  api.delete(`/schedule-lines/${id}`);
export const restoreScheduleLine = id =>
  api.put(`/schedule-lines/${id}/restore`);
