import axios from 'axios';

// Separate axios instance for the big-screen — uses its own (viewer) token,
// completely independent from the admin token.
const iapi = axios.create({ baseURL: import.meta.env.VITE_API_URL || '' });

iapi.interceptors.request.use((config) => {
  const token = localStorage.getItem('pb_itoken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default iapi;
