import { api } from '@/services/api';
import type { Product } from '@/types/catalog';
import type { CandleCustomization } from '@/types/customization';

export type ApiCartItem = {
  id: number;
  customization?: CandleCustomization | null;
  preview_image?: string | null;
  product_id: number;
  quantity: number;
  product: Product;
  variant_key?: string;
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

  async addItem(
    productId: number,
    quantity: number,
    customization?: CandleCustomization | null,
    previewImage?: string | null,
  ): Promise<ApiCart> {
    const response = await api.post<ApiCart>('/cart/items', {
      customization: customization ?? null,
      preview_image: previewImage ?? null,
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  async updateLine(cartItemId: number, productId: number, quantity: number): Promise<ApiCart> {
    const response = await api.patch<ApiCart>(`/cart/lines/${cartItemId}`, {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  async removeLine(cartItemId: number): Promise<ApiCart> {
    const response = await api.delete<ApiCart>(`/cart/lines/${cartItemId}`);
    return response.data;
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart');
  },
};
