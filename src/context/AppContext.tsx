import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import api from '../api';

interface AppContextType {
  // Navigation
  currentScreen: NavigationScreen;
  screenHistory: NavigationScreen[];
  navigateTo: (screen: NavigationScreen) => void;
  goBack: () => void;
  
  // Auth & Passwords
  currentRole: AuthRole;
  ownerProfile: OwnerProfile;
  customerProfile: CustomerProfile;
  isLoggedIn: boolean;
  loginAsOwner: (email: string, password?: string) => Promise<void>;
  loginAsCustomer: (identifier: string, password?: string) => Promise<void>;
  registerOwner: (profile: Partial<OwnerProfile> & { password?: string }) => Promise<void>;
  registerCustomer: (profile: Partial<CustomerProfile> & { password?: string }) => Promise<void>;
  updateOwnerProfile: (profile: Partial<OwnerProfile> & { password?: string }) => void;
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

  // Database & Sync Status
  isBackendConnected: boolean;
  syncWithBackend: () => Promise<void>;

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
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Data persistence with localStorage
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>(() => {
    const saved = localStorage.getItem('meridukan_owner');
    return saved ? JSON.parse(saved) : initialOwnerProfile;
  });

  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    const saved = localStorage.getItem('meridukan_customer_user');
    return saved ? JSON.parse(saved) : {
      customerName: '',
      mobile: '',
      address: '',
      email: '',
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

  // Synchronize state with Backend SQL Database
  const syncWithBackend = useCallback(async () => {
    try {
      await api.checkHealth();
      setIsBackendConnected(true);

      const [pData, bData, cData, eData, oData, profData] = await Promise.allSettled([
        api.getProducts(),
        api.getBills(),
        api.getCustomers(),
        api.getEmployees(),
        api.getOrders(),
        api.getProfile(),
      ]);

      if (pData.status === 'fulfilled') setProducts(pData.value || []);
      if (bData.status === 'fulfilled') setBills(bData.value || []);
      if (cData.status === 'fulfilled') setCustomers(cData.value || []);
      if (eData.status === 'fulfilled') setEmployees(eData.value || []);
      if (oData.status === 'fulfilled') setOrders(oData.value || []);
      if (profData.status === 'fulfilled' && profData.value) setOwnerProfile(profData.value);
    } catch {
      setIsBackendConnected(false);
    }
  }, []);

  // Fetch initial data on mount
  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

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

  // Auth Handlers with Password Verification
  const loginAsOwner = async (email: string, password?: string) => {
    try {
      const profile = await api.loginOwner({ email, password });
      setOwnerProfile(profile);
      setCurrentRole('owner');
      setIsLoggedIn(true);
      navigateTo('ownerDashboard');
    } catch (err) {
      throw err;
    }
  };

  const loginAsCustomer = async (identifier: string, password?: string) => {
    try {
      const profile = await api.loginCustomer({ email: identifier, mobile: identifier, password });
      setCustomerProfile(profile);
      setCurrentRole('customer');
      setIsLoggedIn(true);
      navigateTo('customerDashboard');
    } catch (err) {
      throw err;
    }
  };

  const registerOwner = async (profile: Partial<OwnerProfile> & { password?: string }) => {
    try {
      const created = await api.registerOwner(profile);
      setOwnerProfile(created);
      setCurrentRole('owner');
      setIsLoggedIn(true);
      navigateTo('ownerDashboard');
    } catch (err) {
      throw err;
    }
  };

  const registerCustomer = async (profile: Partial<CustomerProfile> & { password?: string }) => {
    try {
      const created = await api.registerCustomer(profile);
      setCustomerProfile(created);
      setCurrentRole('customer');
      setIsLoggedIn(true);
      navigateTo('customerDashboard');
    } catch (err) {
      throw err;
    }
  };

  const updateOwnerProfile = (profile: Partial<OwnerProfile> & { password?: string }) => {
    const updated = { ...ownerProfile, ...profile };
    setOwnerProfile(updated);
    api.updateProfile(profile).catch(() => {});
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
    const tempId = Date.now();
    const newProduct: Product = {
      ...productData,
      id: tempId,
    };
    setProducts((prev) => [newProduct, ...prev]);

    api.createProduct(productData).then((saved) => {
      setProducts((prev) => prev.map((p) => (p.id === tempId ? saved : p)));
    }).catch(() => {});
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProduct && selectedProduct.id === updated.id) {
      setSelectedProduct(updated);
    }
    api.updateProduct(updated).catch(() => {});
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (selectedProduct && selectedProduct.id === id) {
      setSelectedProduct(null);
    }
    api.deleteProduct(id).catch(() => {});
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

    // Update customer history or record locally
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

    // Persist to backend SQL database
    api.createBill({
      ...billData,
      invoiceNumber,
    }).then((savedBill) => {
      setBills((prev) => prev.map((b) => (b.id === id ? savedBill : b)));
    }).catch(() => {});

    return newBill;
  };

  const updateBill = (updated: Bill) => {
    setBills((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const deleteBill = (id: number) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    api.deleteBill(id).catch(() => {});
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
    const tempId = Date.now();

    const newOrder: OrderRecord = {
      id: tempId,
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerProfile.customerName || 'Customer',
      customerMobile: customerProfile.mobile || '',
      customerAddress: customerProfile.address || '',
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

    // Reduce inventory
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? { ...p, quantity: Math.max(0, p.quantity - orderQuantity) }
          : p
      )
    );

    // Save to SQL backend
    api.createOrder(newOrder).then((saved) => {
      setOrders((prev) => prev.map((o) => (o.id === tempId ? saved : o)));
    }).catch(() => {});

    return newOrder;
  };

  // Customers & Employees
  const addCustomer = (data: Omit<CustomerRecord, 'id' | 'totalPurchases' | 'totalOrders' | 'lastVisited'>) => {
    const tempId = Date.now();
    const newCust: CustomerRecord = {
      ...data,
      id: tempId,
      totalPurchases: 0,
      totalOrders: 0,
      lastVisited: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);

    api.createCustomer(newCust).then((saved) => {
      setCustomers((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
    }).catch(() => {});
  };

  const deleteCustomer = (id: number) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    api.deleteCustomer(id).catch(() => {});
  };

  const addEmployee = (empData: Omit<Employee, 'id' | 'joinDate'>) => {
    const tempId = Date.now();
    const newEmp: Employee = {
      ...empData,
      id: tempId,
      joinDate: new Date().toISOString().split('T')[0],
    };
    setEmployees((prev) => [newEmp, ...prev]);

    api.createEmployee(newEmp).then((saved) => {
      setEmployees((prev) => prev.map((e) => (e.id === tempId ? saved : e)));
    }).catch(() => {});
  };

  const deleteEmployee = (id: number) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    api.deleteEmployee(id).catch(() => {});
  };

  // Database Backup / Reset
  const resetToDefaults = () => {
    setProducts([]);
    setBills([]);
    setOwnerProfile(initialOwnerProfile);
    setCustomers([]);
    setEmployees([]);
    setOrders([]);
    localStorage.clear();
  };

  const exportDatabaseJson = () => {
    api.exportDatabase().then((serverData) => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(serverData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `meridukan_sql_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }).catch(() => {
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
    });
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

      api.restoreDatabase(parsed).catch(() => {});
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
        isBackendConnected,
        syncWithBackend,
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
