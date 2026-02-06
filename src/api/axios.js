import axios from 'axios';

// Base URL matches your server.js port (4000)
const BASE_URL = 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Token to every request (Middleware)
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle Errors (Auto-logout on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- ALL BACKEND ROUTES COVERED HERE ---

export const endpoints = {
  auth: {
    login: (data) => api.post('/auth/login', data),
    changePassword: (data) => api.post('/auth/change-password', data),
    setPin: (data) => api.post('/auth/set-pin', data),
  },
  users: {
    create: (data) => api.post('/users', data),
    getAll: () => api.get('/users'), // Returns list for Dropdowns
    update: (id, data) => api.patch(`/users/${id}`, data),
    getDepartments: () => api.get('/users/departments'),
    createDepartment: (data) => api.post('/users/departments', data),
    getDesignations: () => api.get('/users/designations'),
    createDesignation: (data) => api.post('/users/designations', data),
  },
  files: {
    create: (formData) => api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    inbox: () => api.get('/files/inbox'),
    outbox: () => api.get('/files/outbox'),
    search: (queryString) => api.get(`/files/search?${queryString}`),
    stats: () => api.get('/files/stats'),
    history: (id) => api.get(`/files/${id}/history`),
    // Note: Your backend currently sends a MinIO key/URL. 
    // If you add a specific download route later, add it here.
  },
  workflow: {
    // Matches src/modules/workflow/routes/workflow.routes.js
    move: (fileId, data) => api.post(`/workflow/files/${fileId}/move`, data),
  },
  common: {
    health: () => api.get('/health'),
  }
};

export default api;