import axios from 'axios';

// Base URL matches your server.js port (4000)
const BASE_URL = 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- REQUEST INTERCEPTOR (Fixes the 401 Error) ---
api.interceptors.request.use((config) => {
  // 1. Try getting the token directly (This matches your AuthContext)
  let token = localStorage.getItem('token');

  // 2. Fallback: If not found, check inside the 'user' object (Just in case)
  if (!token) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user?.token || user?.data?.token;
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
  }

  // 3. Attach Token if it exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => Promise.reject(error));

// --- RESPONSE INTERCEPTOR (Handles Expiration) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If Backend says "Unauthorized" (401), force logout
    if (error.response?.status === 401) {
      // Prevent infinite loops if already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- ALL BACKEND ROUTES COVERED HERE ---

export const endpoints = {
  auth: {
    login: (data) => api.post('/auth/login', data),
    // Updated key names to match backend DTOs
    changePassword: (data) => api.post('/auth/change-password', data), 
    setPin: (data) => api.post('/auth/set-pin', data),
  },
  users: {
    create: (data) => api.post('/users', data),
 getAll: (query = '') => api.get(`/users${query}`),
    update: (id, data) => api.patch(`/users/${id}`, data),
    
    // Dropdowns
    getDepartments: () => api.get('/users/departments'),
    getDesignations: () => api.get('/users/designations'),
    
    // Admin Only
    createDepartment: (data) => api.post('/users/departments', data),
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
    
    // --- DOWNLOAD ROUTES (Streaming from MinIO) ---
    downloadPuc: (id) => api.get(`/files/${id}/download-puc`, { responseType: 'blob' }),
    downloadAttachment: (attachmentId) => api.get(`/files/attachment/${attachmentId}/download`, { responseType: 'blob' }),
    downloadSignedDoc: (id) => api.get(`/files/${id}/download-signed`, { responseType: 'blob' }),
    
    // --- ACTIONS ---
    uploadSignedDoc: (id, formData) => api.post(`/files/${id}/sign`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    addAttachment: (id, formData) => api.post(`/files/${id}/attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    removeAttachment: (attachmentId) => api.delete(`/files/attachment/${attachmentId}`),
  },
  workflow: {
    move: (fileId, data) => api.post(`/workflow/files/${fileId}/move`, data),
  },
  common: {
    health: () => api.get('/health'),
    constants: () => api.get('/constants'),
  }
};

export default api;