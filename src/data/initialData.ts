import { Product, Bill, OwnerProfile, CustomerRecord, Employee, OrderRecord } from '../types';

export const initialOwnerProfile: OwnerProfile = {
  ownerName: '',
  businessName: '',
  gstNumber: '',
  address: '',
  mobile: '',
  email: '',
  website: '',
  upi: '',
  bankAccount: '',
  ifsc: '',
};

export const initialProducts: Product[] = [];

export const initialBills: Bill[] = [];

export const initialCustomers: CustomerRecord[] = [];

export const initialEmployees: Employee[] = [];

export const initialOrders: OrderRecord[] = [];
