/**
 * client/src/api.js
 * Shared Axios instance — automatically attaches JWT from localStorage.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
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
