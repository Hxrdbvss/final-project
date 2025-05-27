import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
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
        const response = await api.post('/token/refresh/', { refresh: refreshToken });
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
export const getUserRequests = () => api.get('/requests/user_requests/').then(res => res.data);
export const createRequest = (data) => api.post('/requests/', data).then(res => res.data);
export const cancelRequest = (id) => api.delete(`/requests/${id}/`).then(res => res.data);
export const getProfile = () => api.get('/user-profiles/').then(res => res.data);
export const updateProfile = (data) => api.patch('/user-profiles/me/', data).then(res => res.data);
export const loginUser = (credentials) => api.post('/token/', credentials).then(res => res.data);
export const registerUser = (data) => api.post('/register/', data).then(res => res.data);
export const updateRequest = (id, data) => api.patch(`/requests/${id}/`, data).then(res => res.data);
export const getLocations = () => api.get('/locations/').then(res => res.data);
export const unsubscribeProfile = () => api.delete('/profile/unsubscribe/').then(res => res.data);
export const createEngineer = (data) => api.post('/create-engineer/', data).then(res => res.data);
export const assignEngineer = (requestId, engineerId) => api.patch(`/admin/requests/${requestId}/assign-engineer/`, { engineer_id: engineerId }).then(res => res.data);
export const getAllRequests = () => api.get('/admin/requests/').then(res => res.data);
export const updateRequestStatus = (id, status) => api.patch(`/admin/requests/${id}/update-status/`, { status }).then(res => res.data);
export const getRequest = (id) => api.get(`/requests/${id}/`).then(res => res.data);
export const getAvailableDates = () => api.get('/requests/available-dates/').then(res => res.data);
export const getAvailableEngineers = (date, timeOfDay) => api.get(`/requests/available-engineers/?date=${date}&time_of_day=${timeOfDay}`).then(res => res.data);
export const getEngineers = () => api.get('/engineers/').then(res => res.data);

export default api;