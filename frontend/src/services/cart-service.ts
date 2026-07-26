import { api } from '@/services/api';
import type { Product } from '@/types/catalog';

export type ApiCartItem = {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
  created_at: string;
  updated_at?: string | null;
};

export type ApiCart = {
  items: ApiCartItem[];
  item_count: number;
  subtotal: number;
};

export const cartService = {
  async getCart(): Promise<ApiCart> {
    const response = await api.get<ApiCart>('/cart');
    return response.data;
  },

  async addItem(productId: number, quantity: number): Promise<ApiCart> {
    const response = await api.post<ApiCart>('/cart/items', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  async updateItem(productId: number, quantity: number): Promise<ApiCart> {
    const response = await api.patch<ApiCart>(`/cart/items/${productId}`, {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  async removeItem(productId: number): Promise<ApiCart> {
    const response = await api.delete<ApiCart>(`/cart/items/${productId}`);
    return response.data;
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart');
  },
};
