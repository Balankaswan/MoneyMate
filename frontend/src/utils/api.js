import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('mm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mm_token');
      localStorage.removeItem('mm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

export const transactionAPI = {
  getAll: (params) => API.get('/transactions', { params }),
  create: (data) => API.post('/transactions', data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
  getOne: (id) => API.get(`/transactions/${id}`),
};

export const categoryAPI = {
  getAll: () => API.get('/categories'),
  create: (data) => API.post('/categories', data),
  delete: (id) => API.delete(`/categories/${id}`),
};

export const emiAPI = {
  getAll: () => API.get('/emi'),
  create: (data) => API.post('/emi', data),
  update: (id, data) => API.put(`/emi/${id}`, data),
  delete: (id) => API.delete(`/emi/${id}`),
  markPaid: (id, paymentIndex) => API.post(`/emi/${id}/pay`, { paymentIndex }),
  markUnpaid: (id, paymentIndex) => API.post(`/emi/${id}/unpay`, { paymentIndex }),
};

export const dashboardAPI = { get: () => API.get('/dashboard') };
export const reportsAPI = {
  monthly: (params) => API.get('/reports/monthly', { params }),
  yearly: (params) => API.get('/reports/yearly', { params }),
};
export const insightsAPI = { get: () => API.get('/insights') };
export const subscriptionAPI = {
  getAll: () => API.get('/subscriptions'),
  detect: () => API.post('/subscriptions/detect'),
  analyze: () => API.post('/subscriptions/analyze'),
  trim: (ids) => API.post('/subscriptions/trim', { ids }),
  update: (id, data) => API.put(`/subscriptions/${id}`, data),
  seed: () => API.post('/subscriptions/seed'),
};

export default API;
