export type ViewMode = 
  | 'landing'
  | 'onboarding'
  | 'orders'
  | 'stock'
  | 'analytics'
  | 'customers'
  | 'settings';

export type ShopCategory = 'grocery' | 'vegetables' | 'flowers' | 'crockery' | 'general';

export type CustomerTag = 'Regular' | 'Credit' | 'Bulk Buyer' | 'VIP';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  ordersCount: number;
  totalSpent: number;
  tag: CustomerTag;
  loyaltyPunches: number; // e.g. 7 out of 10 for "Buy 10, get 1 free"
  lastOrderDate: string;
  pendingBalance: number;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  targetTag: string;
  sentAt: string;
  recipientCount: number;
  imageUrl?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: ShopCategory;
  unit: string;
  stock: number;
  price: number;
  lowStockThreshold: number;
  image: string;
  isPopular?: boolean;
  barcode?: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'packing' | 'out_for_delivery' | 'delivered' | 'rejected';
export type PaymentStatus = 'unpaid' | 'paid';
export type PaymentMethod = 'cod' | 'upi' | 'card';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  distance: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  receiptId?: string;
  whatsappMessage?: string;
  handwrittenListUrl?: string;
  deliveryEstimatedMinutes?: number;
}

export interface MerchantProfile {
  ownerName: string;
  gmail: string;
  age: number;
  phone: string;
  shopName: string;
  category: ShopCategory;
  address: string;
  city: string;
  pincode: string;
  aadhar: string;
  whatsappNumber: string;
  isWhatsappVerified: boolean;
  coverageRadiusKm: number;
  isAgentActive: boolean;
  onboardingCompleted: boolean;
}

export interface WholesalerAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  suggestedRestockQty: number;
  unit: string;
  wholesalerName: string;
  wholesalerPhone: string;
  status: 'alert' | 'contacted' | 'delivered';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'ai_bot' | 'system';
  text?: string;
  timestamp: string;
  image?: string;
  orderSummary?: {
    orderId: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
  };
  paymentPrompt?: {
    orderId: string;
    amount: number;
  };
  receipt?: {
    receiptNo: string;
    shopName: string;
    date: string;
    items: OrderItem[];
    total: number;
    paymentMethod: string;
  };
  trackingStatus?: OrderStatus;
}
