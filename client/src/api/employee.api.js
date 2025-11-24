// client/src/api/employee.api.js
import api from './axios';

export function listEmployees(params) {
  return api.get('/employees', { params }).then(r => r.data);
}

export function createEmployee(payload) {
  return api.post('/employees', payload).then(r => r.data);
}

export function updateEmployee(id, payload) {
  return api.put(`/employees/${id}`, payload).then(r => r.data);
}

export function archiveEmployee(id) {
  return api.post(`/employees/${id}/archive`).then(r => r.data);
}

export function restoreEmployee(id) {
  return api.post(`/employees/${id}/restore`).then(r => r.data);
}

export function getEmployee(id) {
  return api.get(`/employees/${id}`).then(r => r.data);
}
