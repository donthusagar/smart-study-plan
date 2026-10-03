import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('study_planner_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // If unauthorized, clear token if expired and not on login page
      const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      if (!isAuthPage && localStorage.getItem('study_planner_token')) {
        localStorage.removeItem('study_planner_token');
        localStorage.removeItem('study_planner_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
