import api from './api';

export const createOrder = (data) => api.post('/orders', data).then((r) => r.data);
export const getMyOrders = () => api.get('/orders/myorders').then((r) => r.data);
export const getOrderById = (id) => api.get(`/orders/${id}`).then((r) => r.data);
export const getAllOrders = (params) => api.get('/orders', { params }).then((r) => r.data);
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data).then((r) => r.data);
export const getDashboardStats = () => api.get('/orders/stats').then((r) => r.data);
