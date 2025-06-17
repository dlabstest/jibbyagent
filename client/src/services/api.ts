import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/user'),
};

// Integrations API
export const integrationsAPI = {
  getTwilioConfig: () => api.get('/integrations/twilio'),
  saveTwilioConfig: (data: { accountSid: string; authToken: string; phoneNumber: string }) =>
    api.post('/integrations/twilio', data),
};

// Calls API
export const callsAPI = {
  makeCall: (data: { to: string; from?: string }) => 
    api.post('/calls/make-call', data),
  getCallHistory: () => api.get('/calls/history'),
};

export default api;
