export interface Product {
  id: number;
  productName: string;
  description: string;
  company: string;
  category: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  gst: number;
  image?: string;
}

export interface BillItem {
  id: number;
  billId?: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  gstPercent: number;
  total: number;
}

export interface Bill {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  date: string;
  time: string;
  subTotal: number;
  gstAmount: number;
  grandTotal: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Credit / Debit Card' | 'Cash on Delivery' | 'Net Banking';
  items?: BillItem[];
}

export interface OwnerProfile {
  ownerName: string;
  businessName: string;
  gstNumber: string;
  address: string;
  mobile: string;
  email: string;
  website: string;
  upi: string;
  bankAccount: string;
  ifsc: string;
}

export interface CustomerProfile {
  customerName: string;
  mobile: string;
  address: string;
  email: string;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  mobile: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  joinDate: string;
}

export interface CustomerRecord {
  id: number;
  name: string;
  mobile: string;
  address: string;
  totalPurchases: number;
  totalOrders: number;
  lastVisited: string;
}

export interface OrderRecord {
  id: number;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  product: Product;
  quantity: number;
  totalAmount: number;
  gstAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending';
  orderDate: string;
  orderTime: string;
}

export type AuthRole = 'owner' | 'customer' | null;

export type NavigationScreen =
  | 'splash'
  | 'choice'
  | 'ownerRegister'
  | 'ownerLogin'
  | 'customerRegister'
  | 'customerLogin'
  | 'ownerDashboard'
  | 'products'
  | 'addProduct'
  | 'editProduct'
  | 'customers'
  | 'employees'
  | 'billing'
  | 'createBill'
  | 'reports'
  | 'settings'
  | 'ownerProfile'
  | 'customerDashboard'
  | 'customerProducts'
  | 'productDetail'
  | 'order'
  | 'payment'
  | 'customerSupport'
  | 'customerOrders';
