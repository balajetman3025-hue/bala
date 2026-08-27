import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Bill,
  OwnerProfile,
  CustomerProfile,
  CustomerRecord,
  Employee,
  OrderRecord,
  AuthRole,
  NavigationScreen,
} from '../types';
import {
  initialProducts,
  initialBills,
  initialOwnerProfile,
  initialCustomers,
  initialEmployees,
  initialOrders,
} from '../data/initialData';

interface AppContextType {
  // Navigation
  currentScreen: NavigationScreen;
  screenHistory: NavigationScreen[];
  navigateTo: (screen: NavigationScreen) => void;
  goBack: () => void;
  
  // Auth
  currentRole: AuthRole;
  ownerProfile: OwnerProfile;
  customerProfile: CustomerProfile;
  isLoggedIn: boolean;
  loginAsOwner: (email?: string) => void;
  loginAsCustomer: (name?: string, mobile?: string, email?: string) => void;
  registerOwner: (profile: Partial<OwnerProfile>) => void;
  registerCustomer: (profile: Partial<CustomerProfile>) => void;
  updateOwnerProfile: (profile: Partial<OwnerProfile>) => void;
  logout: () => void;

  // Products (ProductViewModel)
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  getProductById: (id: number) => Product | undefined;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;

  // Bills (BillViewModel)
  bills: Bill[];
  saveBill: (bill: Omit<Bill, 'id' | 'invoiceNumber'> & { invoiceNumber?: string }) => Bill;
  updateBill: (bill: Bill) => void;
  deleteBill: (id: number) => void;
  getBillById: (id: number) => Bill | undefined;

  // Customer Shopping Flow (CustomerViewModel)
  selectedProduct: Product | null;
  orderQuantity: number;
  selectProduct: (product: Product) => void;
  updateOrderQuantity: (quantity: number) => void;
  clearCustomerOrder: () => void;
  placeOrder: (paymentMethod: string) => OrderRecord;
  orders: OrderRecord[];

  // Directory & Employees
  customers: CustomerRecord[];
  addCustomer: (customer: Omit<CustomerRecord, 'id' | 'totalPurchases' | 'totalOrders' | 'lastVisited'>) => void;
  deleteCustomer: (id: number) => void;
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'joinDate'>) => void;
  deleteEmployee: (id: number) => void;

  // Utilities
  resetToDefaults: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<NavigationScreen>('splash');
  const [screenHistory, setScreenHistory] = useState<NavigationScreen[]>(['splash']);

  // Auth State
  const [currentRole, setCurrentRole] = useState<AuthRole>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Data persistence with localStorage
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>(() => {
    const saved = localStorage.getItem('meridukan_owner');
    return saved ? JSON.parse(saved) : initialOwnerProfile;
  });

  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    const saved = localStorage.getItem('meridukan_customer_user');
    return saved ? JSON.parse(saved) : {
      customerName: 'Priya Mehta',
      mobile: '+91 9820011223',
      address: 'Tower 4, Ace City, Greater Noida West',
      email: 'priya.mehta@example.com',
    };
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('meridukan_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('meridukan_bills');
    return saved ? JSON.parse(saved) : initialBills;
  });

  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    const saved = localStorage.getItem('meridukan_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('meridukan_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    const saved = localStorage.getItem('meridukan_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  // Selected State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('meridukan_owner', JSON.stringify(ownerProfile));
  }, [ownerProfile]);

  useEffect(() => {
    localStorage.setItem('meridukan_customer_user', JSON.stringify(customerProfile));
  }, [customerProfile]);

  useEffect(() => {
    localStorage.setItem('meridukan_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('meridukan_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('meridukan_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('meridukan_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('meridukan_orders', JSON.stringify(orders));
  }, [orders]);

  // Navigation handlers
  const navigateTo = (screen: NavigationScreen) => {
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setScreenHistory((prev) => {
      if (prev.length <= 1) {
        if (currentRole === 'owner') {
          setCurrentScreen('ownerDashboard');
          return ['ownerDashboard'];
        }
        if (currentRole === 'customer') {
          setCurrentScreen('customerDashboard');
          return ['customerDashboard'];
        }
        setCurrentScreen('choice');
        return ['choice'];
      }
      const newHistory = prev.slice(0, -1);
      const previousScreen = newHistory[newHistory.length - 1];
      setCurrentScreen(previousScreen);
      return newHistory;
    });
  };

  // Auth Handlers
  const loginAsOwner = (_email?: string) => {
    setCurrentRole('owner');
    setIsLoggedIn(true);
    navigateTo('ownerDashboard');
  };

  const loginAsCustomer = (name?: string, mobile?: string, email?: string) => {
    setCurrentRole('customer');
    setIsLoggedIn(true);
    if (name) {
      setCustomerProfile((prev) => ({
        ...prev,
        customerName: name,
        mobile: mobile || prev.mobile,
        email: email || prev.email,
      }));
    }
    navigateTo('customerDashboard');
  };

  const registerOwner = (profile: Partial<OwnerProfile>) => {
    setOwnerProfile((prev) => ({
      ...prev,
      ...profile,
    }));
    setCurrentRole('owner');
    setIsLoggedIn(true);
    navigateTo('ownerDashboard');
  };

  const registerCustomer = (profile: Partial<CustomerProfile>) => {
    setCustomerProfile((prev) => ({
      ...prev,
      ...profile,
    }));
    setCurrentRole('customer');
    setIsLoggedIn(true);
    navigateTo('customerDashboard');
  };

  const updateOwnerProfile = (profile: Partial<OwnerProfile>) => {
    setOwnerProfile((prev) => ({
      ...prev,
      ...profile,
    }));
  };

  const logout = () => {
    setCurrentRole(null);
    setIsLoggedIn(false);
    setSelectedProduct(null);
    setEditingProduct(null);
    setScreenHistory(['choice']);
    setCurrentScreen('choice');
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now(),
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProduct && selectedProduct.id === updated.id) {
      setSelectedProduct(updated);
    }
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
    }
  };

  const getProductById = (id: number) => {
    return products.find((p) => p.id === id);
  };

  // Bill CRUD
  const saveBill = (billData: Omit<Bill, 'id' | 'invoiceNumber'> & { invoiceNumber?: string }): Bill => {
    const id = Date.now();
    const invoiceNumber = billData.invoiceNumber || `INV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(3, '0')}`;
    const newBill: Bill = {
      ...billData,
      id,
      invoiceNumber,
    };
    setBills((prev) => [newBill, ...prev]);

    // Update customer history or record
    setCustomers((prev) => {
      const existing = prev.find((c) => c.mobile === billData.customerMobile);
      if (existing) {
        return prev.map((c) =>
          c.mobile === billData.customerMobile
            ? {
                ...c,
                totalPurchases: c.totalPurchases + billData.grandTotal,
                totalOrders: c.totalOrders + 1,
                lastVisited: billData.date,
              }
            : c
        );
      } else {
        const newCust: CustomerRecord = {
          id: Date.now(),
          name: billData.customerName,
          mobile: billData.customerMobile,
          address: billData.customerAddress,
          totalPurchases: billData.grandTotal,
          totalOrders: 1,
          lastVisited: billData.date,
        };
        return [newCust, ...prev];
      }
    });

    // Reduce product inventory if items included
    if (billData.items) {
      billData.items.forEach((item) => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === item.productId
              ? { ...p, quantity: Math.max(0, p.quantity - item.quantity) }
              : p
          )
        );
      });
    }

    return newBill;
  };

  const updateBill = (updated: Bill) => {
    setBills((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const deleteBill = (id: number) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  const getBillById = (id: number) => {
    return bills.find((b) => b.id === id);
  };

  // Customer Shopping
  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setOrderQuantity(1);
  };

  const updateOrderQuantity = (quantity: number) => {
    setOrderQuantity(Math.max(1, quantity));
  };

  const clearCustomerOrder = () => {
    setSelectedProduct(null);
    setOrderQuantity(1);
  };

  const placeOrder = (paymentMethod: string): OrderRecord => {
    if (!selectedProduct) {
      throw new Error('No product selected');
    }

    const subTotal = selectedProduct.sellingPrice * orderQuantity;
    const gstAmt = (subTotal * selectedProduct.gst) / 100;
    const finalAmt = subTotal + gstAmt;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: OrderRecord = {
      id: Date.now(),
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerProfile.customerName,
      customerMobile: customerProfile.mobile,
      customerAddress: customerProfile.address,
      product: selectedProduct,
      quantity: orderQuantity,
      totalAmount: subTotal,
      gstAmount: gstAmt,
      finalAmount: finalAmt,
      paymentMethod,
      paymentStatus: 'Paid',
      orderDate: dateStr,
      orderTime: timeStr,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Also reduce inventory
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? { ...p, quantity: Math.max(0, p.quantity - orderQuantity) }
          : p
      )
    );

    return newOrder;
  };

  // Customers & Employees
  const addCustomer = (data: Omit<CustomerRecord, 'id' | 'totalPurchases' | 'totalOrders' | 'lastVisited'>) => {
    const newCust: CustomerRecord = {
      ...data,
      id: Date.now(),
      totalPurchases: 0,
      totalOrders: 0,
      lastVisited: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
  };

  const deleteCustomer = (id: number) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const addEmployee = (empData: Omit<Employee, 'id' | 'joinDate'>) => {
    const newEmp: Employee = {
      ...empData,
      id: Date.now(),
      joinDate: new Date().toISOString().split('T')[0],
    };
    setEmployees((prev) => [newEmp, ...prev]);
  };

  const deleteEmployee = (id: number) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // Database Backup / Reset
  const resetToDefaults = () => {
    setProducts(initialProducts);
    setBills(initialBills);
    setOwnerProfile(initialOwnerProfile);
    setCustomers(initialCustomers);
    setEmployees(initialEmployees);
    setOrders(initialOrders);
    localStorage.clear();
  };

  const exportDatabaseJson = () => {
    const data = {
      ownerProfile,
      products,
      bills,
      customers,
      employees,
      orders,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `meridukan_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.bills) setBills(parsed.bills);
      if (parsed.ownerProfile) setOwnerProfile(parsed.ownerProfile);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.employees) setEmployees(parsed.employees);
      if (parsed.orders) setOrders(parsed.orders);
      return true;
    } catch (e) {
      console.error('Failed to import database', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        screenHistory,
        navigateTo,
        goBack,
        currentRole,
        ownerProfile,
        customerProfile,
        isLoggedIn,
        loginAsOwner,
        loginAsCustomer,
        registerOwner,
        registerCustomer,
        updateOwnerProfile,
        logout,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        editingProduct,
        setEditingProduct,
        bills,
        saveBill,
        updateBill,
        deleteBill,
        getBillById,
        selectedProduct,
        orderQuantity,
        selectProduct,
        updateOrderQuantity,
        clearCustomerOrder,
        placeOrder,
        orders,
        customers,
        addCustomer,
        deleteCustomer,
        employees,
        addEmployee,
        deleteEmployee,
        resetToDefaults,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
