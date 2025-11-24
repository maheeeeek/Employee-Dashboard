// client/src/api/auth.api.js
import api from './axios';

export function register(data) {
  return api.post('/auth/register', data).then(r => r.data);
}
export function login(data) {
  return api.post('/auth/login', data).then(r => r.data);
}
export function logout() {
  return api.post('/auth/logout').then(r => r.data);
}
export function refresh() {
  return api.get('/auth/refresh').then(r => r.data);
}
export function me() {
  return api.get('/auth/me').then(r => r.data);
}
