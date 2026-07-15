/**
 * client/src/api.js
 * Shared Axios instance — automatically attaches JWT from localStorage.
 */
import axios from 'axios';

const api = axios.create({
  // Use a relative path so this works in both environments:
  // - Local dev: Vite proxies /api → http://localhost:3001/api (see vite.config.js)
  // - Production (Render): same-origin, Express serves /api directly
  baseURL: '/api',
});

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ab_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
