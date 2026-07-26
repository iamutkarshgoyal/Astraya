import { api } from '@/services/api';
import type { Product } from '@/types/catalog';

export const wishlistService = {
  async getWishlist(): Promise<Product[]> {
    const response = await api.get<Product[]>('/wishlist');
    return response.data;
  },

  async addItem(productId: number): Promise<Product[]> {
    const response = await api.post<Product[]>(`/wishlist/${productId}`);
    return response.data;
  },

  async removeItem(productId: number): Promise<Product[]> {
    const response = await api.delete<Product[]>(`/wishlist/${productId}`);
    return response.data;
  },
};
