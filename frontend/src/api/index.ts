import axios from 'axios';
import { ElMessage } from 'element-plus';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    ElMessage.error(error.response?.data?.message || '请求失败');
    return Promise.reject(error);
  },
);

export const orderApi = {
  list: (scheduleStatus?: string) =>
    request.get('/orders', { params: scheduleStatus ? { scheduleStatus } : undefined }),
  detail: (id: string) => request.get(`/orders/${id}`),
  create: (data: any) => request.post('/orders', data),
  updateStatus: (id: string, status: string) =>
    request.put(`/orders/${id}/status`, { status }),
  accept: (id: string, data: any) => request.post(`/orders/${id}/accept`, data),
  updateCraft: (orderId: string, craftId: string, data: any) =>
    request.patch(`/orders/${orderId}/craft/${craftId}`, data),
  delete: (id: string) => request.delete(`/orders/${id}`),
};

export const materialApi = {
  list: () => request.get('/materials'),
  detail: (id: string) => request.get(`/materials/${id}`),
  byOrder: (orderId: string) => request.get(`/materials/order/${orderId}`),
  create: (data: any) => request.post('/materials', data),
  update: (id: string, data: any) => request.put(`/materials/${id}`, data),
  delete: (id: string) => request.delete(`/materials/${id}`),
};

export const tenonApi = {
  list: (type?: string) =>
    request.get('/tenons', { params: type ? { type } : undefined }),
  detail: (id: string) => request.get(`/tenons/${id}`),
  create: (data: any) => request.post('/tenons', data),
  use: (id: string) => request.post(`/tenons/${id}/use`),
  delete: (id: string) => request.delete(`/tenons/${id}`),
};

export const craftApi = {
  list: () => request.get('/crafts'),
  detail: (id: string) => request.get(`/crafts/${id}`),
  create: (data: any) => request.post('/crafts', data),
  update: (id: string, data: any) => request.put(`/crafts/${id}`, data),
  delete: (id: string) => request.delete(`/crafts/${id}`),
};

export const statisticsApi = {
  dashboard: () => request.get('/statistics/dashboard'),
};

export default request;
