export type Locale = 'uz' | 'ru' | 'en';

export type UserRole = 'customer' | 'admin' | 'moderator';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string;
  sku: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  options_json: {
    color?: string;
    size?: string;
    [key: string]: any;
  };
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_thumbnail: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  sale_price: number | null;
  cost_price?: number;
  sku: string | null;
  barcode?: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  category_id: string | null;
  category?: Category;
  is_published: boolean;
  is_featured: boolean;
  is_new: boolean;
  rating: number;
  reviews_count: number;
  attributes_json?: Record<string, any>;
  images: ProductImage[];
  variants?: ProductVariant[];
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  coupon?: Coupon;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'bank_transfer' | 'card' | 'click' | 'payme';
export type DeliveryMethod = 'standard' | 'express' | 'pickup';

export interface DeliveryAddress {
  recipient_name: string;
  phone: string;
  region: string;
  city: string;
  street: string;
  apartment?: string;
  postal_code?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id?: string | null;
  product_name: string;
  variant_title?: string | null;
  sku?: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  delivery_method: DeliveryMethod;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  coupon_code?: string | null;
  delivery_address: DeliveryAddress;
  customer_notes?: string | null;
  admin_notes?: string | null;
  tracking_number?: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount?: number | null;
  usage_limit?: number | null;
  times_used: number;
  is_active: boolean;
  expires_at?: string | null;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title?: string | null;
  comment: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  title: string;
  recipient_name: string;
  phone: string;
  region: string;
  city: string;
  street: string;
  apartment?: string;
  postal_code?: string;
  is_default: boolean;
  created_at: string;
}

export interface StoreSettings {
  store_name: string;
  tagline: string;
  phone: string;
  email: string;
  telegram_channel: string;
  telegram_bot: string;
  address: string;
  free_shipping_threshold: number;
  standard_shipping_fee: number;
  express_shipping_fee: number;
  currency: string;
  default_locale: Locale;
}
