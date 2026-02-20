import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let cachedToken=null;

export const setAuthToken = (token) =>{ cachedToken=token;};

api.interceptors.request.use((config) => {

  if (!cachedToken) {
    cachedToken = localStorage.getItem('token');
  }

  // If we have a token, attach it
  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
  }
  
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';

      if (requestUrl.includes('/auth/set-pin') || requestUrl.includes('/auth/change-password')) {
        return Promise.reject(error);
      }
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  auth: {
    login: (data) => api.post('/auth/login', data),
    changePassword: (data) => api.post('/auth/change-password', data), 
    setPin: (data) => api.post('/auth/set-pin', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
  },
  users: {
    create: (data) => api.post('/users', data),
    getAll: (query = '') => api.get(`/users${query}`),
    update: (id, data) => api.patch(`/users/${id}`, data),
    getDepartments: () => api.get('/users/departments'),
    getDesignations: () => api.get('/users/designations'),
    createDepartment: (data) => api.post('/users/departments', data),
    createDesignation: (data) => api.post('/users/designations', data),
  },
  files: {
    // 🟢 FIX: Send standard JSON payload instead of multipart/form-data
    create: (data) => api.post('/files', data),
    
    inbox: (limit = 10, cursor = null) => 
      api.get(`/files/inbox?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`),
      
    outbox: (limit = 10, cursor = null) => 
      api.get(`/files/outbox?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`),
    
    search: (queryString) => api.get(`/files/search?${queryString}`),
    stats: () => api.get('/files/stats'),
    history: (id) => api.get(`/files/${id}/history`),
    
    downloadPuc: (id) => api.get(`/files/${id}/download-puc`, { responseType: 'blob' }),
    downloadAttachment: (attachmentId) => api.get(`/files/attachment/${attachmentId}/download`, { responseType: 'blob' }),
    downloadSignedDoc: (id) => api.get(`/files/${id}/download-signed`, { responseType: 'blob' }),
    
    uploadSignedDoc: (id, formData) => api.post(`/files/${id}/sign`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    addAttachment: (id, formData) => api.post(`/files/${id}/attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    removeAttachment: (attachmentId) => api.delete(`/files/attachment/${attachmentId}`),
  },
  workflow: {
   move: (fileId, data) => {
      const isFormData = data instanceof FormData;
      return api.post(`/workflow/files/${fileId}/move`, data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
      });
    },
  },
  common: {
    health: () => api.get('/health'),
    constants: () => api.get('/constants'),
  }
};

export default api;