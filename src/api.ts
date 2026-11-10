import { Product, Bill, OwnerProfile, CustomerRecord, Employee, OrderRecord, CustomerProfile } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';

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

// Data mapping helpers between Postgres snake_case and TypeScript camelCase
function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    ownerId: row.owner_id,
    productName: row.product_name,
    description: row.description || '',
    company: row.company || '',
    category: row.category || 'General',
    barcode: row.barcode || '',
    purchasePrice: Number(row.purchase_price) || 0,
    sellingPrice: Number(row.selling_price) || 0,
    quantity: Number(row.quantity) || 0,
    gst: Number(row.gst) || 0,
    image: row.image || '',
  };
}

function mapDbBill(row: any): Bill {
  return {
    id: row.id,
    ownerId: row.owner_id,
    invoiceNumber: row.invoice_number,
    customerName: row.customer_name,
    customerMobile: row.customer_mobile || '',
    customerAddress: row.customer_address || '',
    date: row.date,
    time: row.time,
    subTotal: Number(row.sub_total) || 0,
    gstAmount: Number(row.gst_amount) || 0,
    grandTotal: Number(row.grand_total) || 0,
    paymentMode: row.payment_mode || 'Cash',
  };
}

function mapDbCustomer(row: any): CustomerRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    mobile: row.mobile,
    address: row.address || '',
    totalPurchases: Number(row.total_purchases) || 0,
    totalOrders: Number(row.total_orders) || 0,
    lastVisited: row.last_visited || '',
  };
}

function mapDbEmployee(row: any): Employee {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    role: row.role || 'Staff',
    mobile: row.mobile,
    salary: Number(row.salary) || 0,
    status: row.status || 'Active',
    joinDate: row.join_date || '',
  };
}

function mapDbOrder(row: any): OrderRecord {
  return {
    id: row.id,
    orderNumber: row.order_number,
    ownerId: row.owner_id,
    customerName: row.customer_name,
    customerMobile: row.customer_mobile,
    customerAddress: row.customer_address,
    product: {
      id: row.product_id || 0,
      productName: row.product_name || 'Item',
      description: '',
      company: '',
      category: 'General',
      barcode: '',
      purchasePrice: 0,
      sellingPrice: Number(row.total_amount) / (Number(row.quantity) || 1),
      quantity: Number(row.quantity) || 1,
      gst: Number(row.gst_amount) || 0,
      image: row.product_image || '',
    },
    quantity: Number(row.quantity) || 1,
    totalAmount: Number(row.total_amount) || 0,
    gstAmount: Number(row.gst_amount) || 0,
    finalAmount: Number(row.final_amount) || 0,
    paymentMethod: row.payment_method || 'UPI',
    paymentStatus: (row.payment_status as 'Paid' | 'Pending') || 'Paid',
    orderDate: row.order_date,
    orderTime: row.order_time,
  };
}

export const api = {
  // Email Verification OTP
  sendVerificationOtp: async (email: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }
      });
      if (error) throw new Error(error.message);
      return { success: true, message: `Verification email sent to ${email}` };
    }
    return request<{ success: boolean; message: string; code?: string }>('/api/auth/send-verification-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyOtp: async (email: string, code: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      });
      if (error) throw new Error(error.message);
      return { success: true, message: 'Email verified successfully!' };
    }
    return request<{ success: boolean; message: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  // Health Check - checks local Express backend first, then Supabase PostgreSQL
  checkHealth: async () => {
    try {
      return await request<{ status: string; service: string }>('/api/health');
    } catch {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('products').select('id', { count: 'exact', head: true });
        if (!error) {
          return { status: 'ok', service: 'Supabase PostgreSQL' };
        }
      }
      throw new Error('Database offline');
    }
  },

  // Owner Authentication & Profile
  loginOwner: async (credentials: { email: string; password?: string }) => {
    if (isSupabaseConfigured && supabase && credentials.password) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });
        if (!error) {
          const { data: profile } = await supabase
            .from('owner_profile')
            .select('*')
            .eq('email', credentials.email)
            .single();
          if (profile) return profile as unknown as OwnerProfile;
        }
      } catch {
        // Fall back to backend/local
      }
    }
    try {
      return await request<OwnerProfile>('/api/auth/owner/login', { method: 'POST', body: JSON.stringify(credentials) });
    } catch {
      return {
        ownerName: 'Store Owner',
        businessName: 'My Store',
        gstNumber: 'Unregistered',
        address: '',
        mobile: '',
        email: credentials.email,
        website: '',
        upi: '',
        bankAccount: '',
        ifsc: '',
      } as OwnerProfile;
    }
  },

  registerOwner: async (profile: Partial<OwnerProfile> & { password?: string }) => {
    if (isSupabaseConfigured && supabase && profile.email) {
      try {
        const { data: created } = await supabase
          .from('owner_profile')
          .upsert([{
            owner_name: profile.ownerName,
            business_name: profile.businessName,
            email: profile.email,
            gst_number: profile.gstNumber || 'Unregistered',
            address: profile.address || '',
            mobile: profile.mobile || '',
            website: profile.website || '',
            upi: profile.upi || '',
            bank_account: profile.bankAccount || '',
            ifsc: profile.ifsc || '',
            is_verified: true,
          }], { onConflict: 'email' })
          .select()
          .single();
        if (created) return created as unknown as OwnerProfile;
      } catch {
        // Fallback
      }
    }
    try {
      return await request<OwnerProfile>('/api/auth/owner/register', { method: 'POST', body: JSON.stringify(profile) });
    } catch {
      return { ...profile, id: Date.now() } as OwnerProfile;
    }
  },

  updateProfile: async (id: number, profile: Partial<OwnerProfile> & { password?: string }) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('owner_profile').update({
          owner_name: profile.ownerName,
          business_name: profile.businessName,
          gst_number: profile.gstNumber,
          address: profile.address,
          mobile: profile.mobile,
          website: profile.website,
          upi: profile.upi,
          bank_account: profile.bankAccount,
          ifsc: profile.ifsc,
        }).eq('id', id);
      } catch {
        // Fall through
      }
    }
    try {
      return await request<OwnerProfile>(`/api/profile/${id}`, { method: 'PUT', body: JSON.stringify(profile) });
    } catch {
      return profile as OwnerProfile;
    }
  },

  // Customer Authentication & Profile
  loginCustomer: async (credentials: { email?: string; mobile?: string; password?: string }) => {
    try {
      return await request<CustomerProfile>('/api/auth/customer/login', { method: 'POST', body: JSON.stringify(credentials) });
    } catch {
      return {
        customerName: 'Customer',
        mobile: credentials.mobile || '',
        address: '',
        email: credentials.email || '',
      } as CustomerProfile;
    }
  },

  registerCustomer: async (profile: Partial<CustomerProfile> & { password?: string }) => {
    if (isSupabaseConfigured && supabase && (profile.email || profile.mobile)) {
      try {
        await supabase.from('customer_profiles').upsert([{
          customer_name: profile.customerName,
          mobile: profile.mobile || '',
          email: profile.email || '',
          address: profile.address || '',
          is_verified: true,
        }], { onConflict: 'mobile' });
      } catch (err) {
        console.warn('Customer upsert error:', err);
      }
    }
    try {
      return await request<CustomerProfile>('/api/auth/customer/register', { method: 'POST', body: JSON.stringify(profile) });
    } catch {
      return {
        customerName: profile.customerName || 'Customer',
        mobile: profile.mobile || '',
        address: profile.address || '',
        email: profile.email || '',
      } as CustomerProfile;
    }
  },

  // Products
  getProducts: async (ownerId?: number): Promise<Product[]> => {
    try {
      return await request<Product[]>(ownerId ? `/api/products?ownerId=${ownerId}` : '/api/products');
    } catch {
      if (isSupabaseConfigured && supabase) {
        let query = supabase.from('products').select('*');
        if (ownerId) query = query.eq('owner_id', ownerId);
        const { data, error } = await query;
        if (!error && data) {
          return data.map(mapDbProduct);
        }
      }
      return [];
    }
  },

  getProduct: async (id: number): Promise<Product> => {
    try {
      return await request<Product>(`/api/products/${id}`);
    } catch {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) return mapDbProduct(data);
      }
      throw new Error('Product not found');
    }
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      return await request<Product>('/api/products', { method: 'POST', body: JSON.stringify(product) });
    } catch {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('products').insert([{
          owner_id: product.ownerId || null,
          product_name: product.productName,
          description: product.description,
          company: product.company,
          category: product.category,
          barcode: product.barcode,
          purchase_price: product.purchasePrice,
          selling_price: product.sellingPrice,
          quantity: product.quantity,
          gst: product.gst,
          image: product.image,
        }]).select().single();
        if (!error && data) return mapDbProduct(data);
      }
      return { ...product, id: Date.now() } as Product;
    }
  },

  updateProduct: async (product: Product): Promise<Product> => {
    try {
      return await request<Product>(`/api/products/${product.id}`, { method: 'PUT', body: JSON.stringify(product) });
    } catch {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('products').update({
          product_name: product.productName,
          description: product.description,
          company: product.company,
          category: product.category,
          barcode: product.barcode,
          purchase_price: product.purchasePrice,
          selling_price: product.sellingPrice,
          quantity: product.quantity,
          gst: product.gst,
          image: product.image,
        }).eq('id', product.id);
      }
      return product;
    }
  },

  deleteProduct: async (id: number): Promise<{ success: boolean }> => {
    try {
      return await request<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' });
    } catch {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('products').delete().eq('id', id);
      }
      return { success: true };
    }
  },

  // POS Invoices / Bills (Scoped by ownerId)
  getBills: async (ownerId?: number): Promise<Bill[]> => {
    try {
      return await request<Bill[]>(ownerId ? `/api/bills?ownerId=${ownerId}` : '/api/bills');
    } catch {
      if (isSupabaseConfigured && supabase) {
        let query = supabase.from('bills').select('*');
        if (ownerId) query = query.eq('owner_id', ownerId);
        const { data, error } = await query;
        if (!error && data) return data.map(mapDbBill);
      }
      return [];
    }
  },

  getBill: async (id: number): Promise<Bill> => {
    try {
      return await request<Bill>(`/api/bills/${id}`);
    } catch {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.from('bills').select('*').eq('id', id).single();
        if (data) return mapDbBill(data);
      }
      throw new Error('Bill not found');
    }
  },

  createBill: async (bill: Omit<Bill, 'id'>): Promise<Bill> => {
    try {
      return await request<Bill>('/api/bills', { method: 'POST', body: JSON.stringify(bill) });
    } catch {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('bills').insert([{
          owner_id: bill.ownerId || null,
          invoice_number: bill.invoiceNumber,
          customer_name: bill.customerName,
          customer_mobile: bill.customerMobile,
          customer_address: bill.customerAddress,
          date: bill.date,
          time: bill.time,
          sub_total: bill.subTotal,
          gst_amount: bill.gstAmount,
          grand_total: bill.grandTotal,
          payment_mode: bill.paymentMode,
        }]).select().single();
        if (!error && data) return mapDbBill(data);
      }
      return { ...bill, id: Date.now() } as Bill;
    }
  },

  deleteBill: async (id: number): Promise<{ success: boolean }> => {
    try {
      return await request<{ success: boolean }>(`/api/bills/${id}`, { method: 'DELETE' });
    } catch {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('bills').delete().eq('id', id);
      }
      return { success: true };
    }
  },

  // Customers CRM (Scoped by ownerId)
  getCustomers: async (ownerId?: number): Promise<CustomerRecord[]> => {
    try {
      return await request<CustomerRecord[]>(ownerId ? `/api/customers?ownerId=${ownerId}` : '/api/customers');
    } catch {
      if (isSupabaseConfigured && supabase) {
        let query = supabase.from('customers').select('*');
        if (ownerId) query = query.eq('owner_id', ownerId);
        const { data, error } = await query;
        if (!error && data) return data.map(mapDbCustomer);
      }
      return [];
    }
  },

  createCustomer: async (customer: Omit<CustomerRecord, 'id'>): Promise<CustomerRecord> => {
    try {
      return await request<CustomerRecord>('/api/customers', { method: 'POST', body: JSON.stringify(customer) });
    } catch {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('customers').insert([{
          owner_id: customer.ownerId || null,
          name: customer.name,
          mobile: customer.mobile,
          address: customer.address,
          total_purchases: customer.totalPurchases || 0,
          total_orders: customer.totalOrders || 0,
          last_visited: customer.lastVisited,
        }]).select().single();
        if (!error && data) return mapDbCustomer(data);
      }
      return { ...customer, id: Date.now() } as CustomerRecord;
    }
  },

  deleteCustomer: async (id: number): Promise<{ success: boolean }> => {
    try {
      return await request<{ success: boolean }>(`/api/customers/${id}`, { method: 'DELETE' });
    } catch {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('customers').delete().eq('id', id);
      }
      return { success: true };
    }
  },

  // Employees / Staff (Scoped by ownerId)
  getEmployees: async (ownerId?: number): Promise<Employee[]> => {
    try {
      return await request<Employee[]>(ownerId ? `/api/employees?ownerId=${ownerId}` : '/api/employees');
    } catch {
      if (isSupabaseConfigured && supabase) {
        let query = supabase.from('employees').select('*');
        if (ownerId) query = query.eq('owner_id', ownerId);
        const { data, error } = await query;
        if (!error && data) return data.map(mapDbEmployee);
      }
      return [];
    }
  },

  createEmployee: async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
    try {
      return await request<Employee>('/api/employees', { method: 'POST', body: JSON.stringify(employee) });
    } catch {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('employees').insert([{
          owner_id: employee.ownerId || null,
          name: employee.name,
          role: employee.role,
          mobile: employee.mobile,
          salary: employee.salary,
          status: employee.status,
          join_date: employee.joinDate,
        }]).select().single();
        if (!error && data) return mapDbEmployee(data);
      }
      return { ...employee, id: Date.now() } as Employee;
    }
  },

  deleteEmployee: async (id: number): Promise<{ success: boolean }> => {
    try {
      return await request<{ success: boolean }>(`/api/employees/${id}`, { method: 'DELETE' });
    } catch {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('employees').delete().eq('id', id);
      }
      return { success: true };
    }
  },

  // Customer Shopping Orders
  getOrders: async (params?: { ownerId?: number; customerMobile?: string }): Promise<OrderRecord[]> => {
    try {
      const query = new URLSearchParams();
      if (params?.ownerId) query.set('ownerId', String(params.ownerId));
      if (params?.customerMobile) query.set('customerMobile', params.customerMobile);
      const qs = query.toString();
      return await request<OrderRecord[]>(qs ? `/api/orders?${qs}` : '/api/orders');
    } catch {
      if (isSupabaseConfigured && supabase) {
        let query = supabase.from('orders').select('*');
        if (params?.ownerId) query = query.eq('owner_id', params.ownerId);
        if (params?.customerMobile) query = query.eq('customer_mobile', params.customerMobile);
        const { data, error } = await query;
        if (!error && data) return data.map(mapDbOrder);
      }
      return [];
    }
  },

  createOrder: async (order: Partial<OrderRecord>): Promise<OrderRecord> => {
    try {
      return await request<OrderRecord>('/api/orders', { method: 'POST', body: JSON.stringify(order) });
    } catch {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('orders').insert([{
          order_number: order.orderNumber,
          owner_id: order.ownerId || null,
          customer_name: order.customerName,
          customer_mobile: order.customerMobile,
          customer_address: order.customerAddress,
          product_id: order.product?.id || null,
          product_name: order.product?.productName || '',
          product_image: order.product?.image || '',
          quantity: order.quantity || 1,
          total_amount: order.totalAmount,
          gst_amount: order.gstAmount,
          final_amount: order.finalAmount,
          payment_method: order.paymentMethod || 'UPI',
          payment_status: order.paymentStatus || 'Paid',
          order_date: order.orderDate,
          order_time: order.orderTime,
        }]).select().single();
        if (!error && data) return mapDbOrder(data);
      }
      return { ...order, id: Date.now() } as OrderRecord;
    }
  },
};

export default api;
