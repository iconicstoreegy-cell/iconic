import api from './api';

export const getProducts = (params) => api.get('/products', { params }).then((r) => r.data);
export const getProductById = (id) => api.get(`/products/${id}`).then((r) => r.data);
export const getProductBySlug = (slug) => api.get(`/products/slug/${slug}`).then((r) => r.data);
export const getRelatedProducts = (id) => api.get(`/products/${id}/related`).then((r) => r.data);
export const createProduct = (data) => api.post('/products', data).then((r) => r.data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);
export const addReview = (id, data) => api.post(`/products/${id}/reviews`, data).then((r) => r.data);
