import { api } from '@/services/api';
import type {
  Category,
  Product,
  ProductFilters,
  ProductListResponse,
} from '@/types/catalog';
import type { Review, ReviewCreatePayload } from '@/types/commerce';

function paramsFromFilters(filters: ProductFilters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
  );
}

export const catalogService = {
  async listCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  async getCategory(slug: string): Promise<Category> {
    const response = await api.get<Category>(`/categories/${slug}`);
    return response.data;
  },

  async listProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const response = await api.get<ProductListResponse>('/products', {
      params: paramsFromFilters(filters),
    });
    return response.data;
  },

  async getProduct(slug: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${slug}`);
    return response.data;
  },

  async listReviews(productId: number): Promise<Review[]> {
    const response = await api.get<Review[]>(`/reviews/product/${productId}`);
    return response.data;
  },

  async createReview(payload: ReviewCreatePayload): Promise<Review> {
    const response = await api.post<Review>('/reviews', payload);
    return response.data;
  },
};
