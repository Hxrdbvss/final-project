import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', config.method, config.url, config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('/api/token/refresh/', { refresh: refreshToken });
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    console.log('Response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const getRequests = () => api.get('/requests/').then(res => res.data);
export const createRequest = (data) => api.post('/requests/', data).then(res => res.data);
export const cancelRequest = (id) => api.delete(`/requests/${id}/`).then(res => res.data);
export const getProfile = () => api.get('/profile/').then(res => res.data);
export const updateProfile = (data) => api.put('/profile/', data).then(res => res.data);
export const loginUser = (credentials) => axios.post('/api/token/', credentials).then(res => res.data);
export const registerUser = (data) => axios.post('/api/register/', data).then(res => res.data);
export const updateRequest = (id, data) => api.put(`/requests/${id}/`, data).then(res => res.data);
export const getLocations = () => api.get('/locations/').then(res => res.data);

// Добавляем функцию unsubscribeProfile
export const unsubscribeProfile = () => api.delete('/profile/unsubscribe/').then(res => res.data);

export default api;