import { api } from '@/services/api';
import type { User } from '@/types/auth';
import type { AdminStats, Order } from '@/types/commerce';
import type { ContactMessage, NewsletterSubscriber } from '@/types/engagement';
import type { Category, Product } from '@/types/catalog';

export type CategoryWritePayload = {
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order?: number;
  is_active?: boolean;
};

export type ProductImageWritePayload = {
  image_url: string;
  alt_text: string;
  display_order?: number;
  is_primary?: boolean;
};

export type ProductWritePayload = {
  category_id: number;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  description: string;
  price: number;
  discount_price?: number | null;
  stock_quantity: number;
  burn_time_minutes?: number | null;
  wax_type?: string | null;
  fragrance?: string | null;
  ingredients?: string | null;
  weight_grams?: number | null;
  dimensions?: string | null;
  is_featured?: boolean;
  is_best_seller?: boolean;
  is_active?: boolean;
  images?: ProductImageWritePayload[];
};

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await api.get<AdminStats>('/admin/stats');
    return response.data;
  },

  async listCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/admin/categories');
    return response.data;
  },

  async createCategory(payload: CategoryWritePayload): Promise<Category> {
    const response = await api.post<Category>('/admin/categories', payload);
    return response.data;
  },

  async updateCategory(id: number, payload: Partial<CategoryWritePayload>): Promise<Category> {
    const response = await api.patch<Category>(`/admin/categories/${id}`, payload);
    return response.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/admin/categories/${id}`);
  },

  async listProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('/admin/products');
    return response.data;
  },

  async createProduct(payload: ProductWritePayload): Promise<Product> {
    const response = await api.post<Product>('/admin/products', payload);
    return response.data;
  },

  async updateProduct(id: number, payload: Partial<ProductWritePayload>): Promise<Product> {
    const response = await api.patch<Product>(`/admin/products/${id}`, payload);
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/admin/products/${id}`);
  },

  async listOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/admin/orders');
    return response.data;
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const response = await api.patch<Order>(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  async listCustomers(): Promise<User[]> {
    const response = await api.get<User[]>('/admin/customers');
    return response.data;
  },

  async listContactMessages(): Promise<ContactMessage[]> {
    const response = await api.get<ContactMessage[]>('/admin/contact-messages');
    return response.data;
  },

  async listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    const response = await api.get<NewsletterSubscriber[]>('/admin/newsletter');
    return response.data;
  },
};
