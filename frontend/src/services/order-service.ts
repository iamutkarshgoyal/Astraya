import { api } from '@/services/api';
import type {
  Order,
  OrderCreatePayload,
  OrderCreateResponse,
  OrderTracking,
} from '@/types/commerce';

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

  async verifyOnlinePayment(payload: {
    order_number: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<OrderCreateResponse> {
    const response = await api.post<OrderCreateResponse>('/orders/verify-payment', payload);
    return response.data;
  },

  async trackOrder(payload: { order_number: string; phone: string }): Promise<OrderTracking> {
    const response = await api.post<OrderTracking>('/orders/track', payload);
    return response.data;
  },
};
