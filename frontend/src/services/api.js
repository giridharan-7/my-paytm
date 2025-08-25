import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    
    const message = error.response?.data?.message || 'Something went wrong';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/user/signup', userData);
    return response.data;
  },
  
  signin: async (credentials) => {
    const response = await api.post('/user/signin', credentials);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/user/profile', userData);
    return response.data;
  }
};

// Account API
export const accountAPI = {
  getBalance: async () => {
    const response = await api.get('/account/balance');
    return response.data;
  },
  
  transfer: async (transferData) => {
    const response = await api.post('/account/transfer', transferData);
    return response.data;
  },
  
  getStatement: async () => {
    const response = await api.get('/account/statement');
    return response.data;
  }
};

// User API
export const userAPI = {
  searchUsers: async (filter) => {
    const response = await api.get(`/user/search?filter=${encodeURIComponent(filter)}`);
    return response.data;
  },
  
  getTransactions: async (page = 1, limit = 10) => {
    const response = await api.get(`/user/transactions?page=${page}&limit=${limit}`);
    return response.data;
  }
};

export default api;
