import { Product, Bill, OwnerProfile, CustomerRecord, Employee, OrderRecord, CustomerProfile } from './types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorBody.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; service: string }>('/api/health'),

  // Owner Authentication & Profile
  loginOwner: (credentials: { email: string; password?: string }) =>
    request<OwnerProfile>('/api/auth/owner/login', { method: 'POST', body: JSON.stringify(credentials) }),
  registerOwner: (profile: Partial<OwnerProfile> & { password?: string }) =>
    request<OwnerProfile>('/api/auth/owner/register', { method: 'POST', body: JSON.stringify(profile) }),
  getProfile: () => request<OwnerProfile>('/api/profile'),
  updateProfile: (profile: Partial<OwnerProfile> & { password?: string }) => 
    request<OwnerProfile>('/api/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  // Customer Authentication & Profile
  loginCustomer: (credentials: { email?: string; mobile?: string; password?: string }) =>
    request<CustomerProfile>('/api/auth/customer/login', { method: 'POST', body: JSON.stringify(credentials) }),
  registerCustomer: (profile: Partial<CustomerProfile> & { password?: string }) =>
    request<CustomerProfile>('/api/auth/customer/register', { method: 'POST', body: JSON.stringify(profile) }),

  // Products
  getProducts: () => request<Product[]>('/api/products'),
  getProduct: (id: number) => request<Product>(`/api/products/${id}`),
  createProduct: (product: Omit<Product, 'id'>) =>
    request<Product>('/api/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (product: Product) =>
    request<Product>(`/api/products/${product.id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id: number) =>
    request<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' }),

  // POS Invoices / Bills
  getBills: () => request<Bill[]>('/api/bills'),
  getBill: (id: number) => request<Bill>(`/api/bills/${id}`),
  createBill: (bill: Omit<Bill, 'id'>) =>
    request<Bill>('/api/bills', { method: 'POST', body: JSON.stringify(bill) }),
  deleteBill: (id: number) =>
    request<{ success: boolean }>(`/api/bills/${id}`, { method: 'DELETE' }),

  // Customers CRM
  getCustomers: () => request<CustomerRecord[]>('/api/customers'),
  createCustomer: (customer: Omit<CustomerRecord, 'id'>) =>
    request<CustomerRecord>('/api/customers', { method: 'POST', body: JSON.stringify(customer) }),
  deleteCustomer: (id: number) =>
    request<{ success: boolean }>(`/api/customers/${id}`, { method: 'DELETE' }),

  // Employees / Staff
  getEmployees: () => request<Employee[]>('/api/employees'),
  createEmployee: (employee: Omit<Employee, 'id'>) =>
    request<Employee>('/api/employees', { method: 'POST', body: JSON.stringify(employee) }),
  deleteEmployee: (id: number) =>
    request<{ success: boolean }>(`/api/employees/${id}`, { method: 'DELETE' }),

  // Customer Shopping Orders
  getOrders: () => request<OrderRecord[]>('/api/orders'),
  createOrder: (order: Partial<OrderRecord>) =>
    request<OrderRecord>('/api/orders', { method: 'POST', body: JSON.stringify(order) }),

  // Backup & Restore
  exportDatabase: () => request<any>('/api/backup'),
  restoreDatabase: (data: any) =>
    request<{ success: boolean }>('/api/restore', { method: 'POST', body: JSON.stringify(data) }),
};

export default api;
