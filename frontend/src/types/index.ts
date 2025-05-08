export interface User {
  _id: string;
  name: string;
  email: string;
  addresses?: {
    address: string;
    city: string;
    state: string;
    pincode: number;
    country: string;
  }[];
  orders?: string[];
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  type: 'CPU' | 'GPU' | 'RAM' | 'Storage' | 'Motherboard' | 'Keyboard' | 'Mouse' | 'Monitor' | 'Cabinet' | 'Others';
  brand: string;
  image: string | string[];
  averageRating: number;
  sspecs?: {
    processor?: string;
    cores?: number;
    memory?: string;
    storage?: string;
    dimensions?: string;
    weight?: string;
    wattage?: number;
    additionalDetails?: string;
  };
}

export interface ProductReview {
  userId: string;
  comment: string;
  rating: number;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  products: Array<{
    product: Product;
    quantity: number;
  }>;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  _id: string;
  userId: string;
  products: Product[];
}

export interface OrderItem {
  productId: Product;
  quantity: number;
  price: number;
}

export interface Address {
  _id?: string;
  address: string;
  city: string;
  state: string;
  pincode: number;
  country: string;
}

export interface TrackingEvent {
  status: string;
  timestamp: string;
  note: string;
}

export interface TrackingInfo {
  orderId: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingId: string | null;
  trackingUrl: string | null;
  courierName: string | null;
  orderDate: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  trackingHistory: TrackingEvent[];
}

export interface Order {
  _id: string;
  userId: string;
  products: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  orderDate: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingId?: string;
  trackingUrl?: string;
  courierName?: string;
  trackingHistory?: TrackingEvent[];
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: number;
    country: string;
  };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  pincode: number;
  country: string;
} 