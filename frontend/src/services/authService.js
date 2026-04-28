import api from './api';

export const login = (data) => api.post('/auth/login', data).then((r) => r.data);
export const register = (data) => api.post('/auth/register', data).then((r) => r.data);
export const verifyOTP = (data) => api.post('/auth/verify-otp', data).then((r) => r.data);
export const resendOTP = (data) => api.post('/auth/resend-otp', data).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
export const updateProfile = (data) => api.put('/auth/profile', data).then((r) => r.data);
