import axios from 'axios';

// Base URL is empty in dev (Vite proxies /api). In prod set VITE_API_URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Attach admin JWT (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
