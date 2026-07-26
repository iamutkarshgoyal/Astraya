export type PriceValue = number | string;

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
  product_count: number;
  created_at: string;
};

export type ProductImage = {
  id: number;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
};

export type Product = {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  description: string;
  price: PriceValue;
  discount_price?: PriceValue | null;
  stock_quantity: number;
  burn_time_minutes?: number | null;
  wax_type?: string | null;
  fragrance?: string | null;
  ingredients?: string | null;
  weight_grams?: number | null;
  dimensions?: string | null;
  is_featured: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  category: Category;
  images: ProductImage[];
  primary_image_url?: string | null;
  average_rating: number;
  review_count: number;
  created_at: string;
  updated_at?: string | null;
};

export type ProductListResponse = {
  items: Product[];
  total: number;
};

export type ProductFilters = {
  category?: string;
  search?: string;
  featured?: boolean;
  best_seller?: boolean;
};
