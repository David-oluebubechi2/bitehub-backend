export type Role = 'ADMIN' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  name: string;
  phone: string;
  avatar: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  emoji: string;
  gradient: string;
  active: boolean;
  sortOrder: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  emoji: string;
  gradient: string;
  available: boolean;
  popular: boolean;
  rating: number;
  reviewCount: number;
  prepTime: number;
  tags: string[];
  addOns: AddOn[];
  createdAt: string;
}

export type CouponType = 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  active: boolean;
  expiresAt: string | null;
  usageCount: number;
  createdAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type Fulfillment = 'DELIVERY' | 'PICKUP';
export type PaymentMethod = 'CARD' | 'CASH' | 'WALLET';

export interface OrderItem {
  productId: string;
  name: string;
  emoji: string;
  price: number;
  quantity: number;
  addOns: { name: string; price: number }[];
  notes: string;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  at: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  fulfillment: Fulfillment;
  address: Address | null;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  couponCode: string | null;
  notes: string;
  timeline: OrderTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'ORDER' | 'PROMO' | 'ACCOUNT';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface Restaurant {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  deliveryFee: number;
  freeDeliveryOver: number;
  currency: string;
}

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  name: string;
  phone: string;
  avatar: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface SupportFaq {
  question: string;
  answer: string;
}

export interface SupportSettings {
  email: string;
  phone: string;
  whatsapp: string;
  hours: string;
  address: string;
  responseTime: string;
  faqs: SupportFaq[];
}

export interface AuthTokens {
  accessToken: string;
  user: PublicUser;
}
