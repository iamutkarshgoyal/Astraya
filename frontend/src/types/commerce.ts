import type { Product } from '@/types/catalog';
import type { User } from '@/types/auth';
import type { CandleCustomization } from '@/types/customization';

export type CartLine = {
  cartItemId?: number;
  customization?: CandleCustomization | null;
  lineId: string;
  previewImage?: string | null;
  product: Product;
  quantity: number;
  variantKey: string;
};

export type OrderItemCreate = {
  customization?: CandleCustomization | null;
  preview_image?: string | null;
  product_id: number;
  quantity: number;
};

export type OrderCreatePayload = {
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  special_instructions?: string | null;
  coupon_code?: string | null;
  items: OrderItemCreate[];
};

export type OrderItem = {
  id: number;
  product_id?: number | null;
  product_name: string;
  customization?: CandleCustomization | null;
  preview_image?: string | null;
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
};

export type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  special_instructions?: string | null;
  subtotal: number | string;
  shipping_charge: number | string;
  tax_amount: number | string;
  discount_amount: number | string;
  grand_total: number | string;
  status: string;
  email_notification_status?: string;
  whatsapp_notification_status?: string;
  notification_error?: string | null;
  items: OrderItem[];
  created_at: string;
};

export type OrderCreateResponse = {
  order: Order;
  whatsapp_url: string;
  whatsapp_message: string;
};

export type Review = {
  id: number;
  product_id: number;
  user_id?: number | null;
  rating: number;
  title?: string | null;
  comment: string;
  is_approved: boolean;
  user?: User | null;
  created_at: string;
};

export type ReviewCreatePayload = {
  product_id: number;
  rating: number;
  title?: string | null;
  comment: string;
};

export type AdminStats = {
  total_customers: number;
  total_orders: number;
  total_products: number;
  pending_orders: number;
  revenue: number;
  newsletter_subscribers: number;
};
