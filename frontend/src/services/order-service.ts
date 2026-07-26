import { api } from '@/services/api';
import type { Order, OrderCreatePayload, OrderCreateResponse } from '@/types/commerce';

export const orderService = {
  async createOrder(payload: OrderCreatePayload): Promise<OrderCreateResponse> {
    const response = await api.post<OrderCreateResponse>('/orders', payload);
    return response.data;
  },

  async getOrder(orderNumber: string): Promise<Order> {
    const response = await api.get<Order>(`/orders/${orderNumber}`);
    return response.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders/me');
    return response.data;
  },
};
