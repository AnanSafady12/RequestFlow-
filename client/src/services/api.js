import axios from 'axios';

// Create a configured Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject JWT Bearer Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 errors (JWT expired or invalid) to clean up session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns a 401 Unauthorized, the token is invalid or expired
    if (error.response && error.response.status === 401) {
      // Clear token and user details from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there or registering
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/verify-email') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
