-- MERIDUKAN Multi-Owner SQL Database Schema

-- 1. Store Owners (Multiple owners supported, each has their own account & store data)
CREATE TABLE IF NOT EXISTS owner_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerName TEXT NOT NULL,
    businessName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT,
    gstNumber TEXT,
    address TEXT,
    mobile TEXT,
    website TEXT,
    upi TEXT,
    bankAccount TEXT,
    ifsc TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Registered Customers
CREATE TABLE IF NOT EXISTS customer_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    address TEXT,
    passwordHash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products (Scoped to ownerId; customers see all products from all owners)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerId INTEGER REFERENCES owner_profile(id) ON DELETE CASCADE,
    productName TEXT NOT NULL,
    description TEXT,
    company TEXT,
    category TEXT,
    barcode TEXT,
    purchasePrice REAL DEFAULT 0,
    sellingPrice REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    gst REAL NOT NULL DEFAULT 0,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Store Customers CRM (Scoped to ownerId so owner sees only their buyers)
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerId INTEGER REFERENCES owner_profile(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    address TEXT,
    totalPurchases REAL DEFAULT 0,
    totalOrders INTEGER DEFAULT 0,
    lastVisited TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Staff & Employees (Scoped to ownerId)
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerId INTEGER REFERENCES owner_profile(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    mobile TEXT NOT NULL,
    salary REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    joinDate TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. POS Invoices / Bills (Scoped to ownerId)
CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownerId INTEGER REFERENCES owner_profile(id) ON DELETE CASCADE,
    invoiceNumber TEXT NOT NULL,
    customerName TEXT NOT NULL,
    customerMobile TEXT,
    customerAddress TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    subTotal REAL NOT NULL,
    gstAmount REAL NOT NULL,
    grandTotal REAL NOT NULL,
    paymentMode TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. POS Bill Line Items
CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    billId INTEGER NOT NULL,
    productId INTEGER,
    productName TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    gstPercent REAL NOT NULL,
    total REAL NOT NULL,
    FOREIGN KEY (billId) REFERENCES bills(id) ON DELETE CASCADE
);

-- 8. Customer Online Orders (Has ownerId so the store owner receives the order & customer details)
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderNumber TEXT UNIQUE NOT NULL,
    ownerId INTEGER REFERENCES owner_profile(id),
    customerName TEXT NOT NULL,
    customerMobile TEXT NOT NULL,
    customerAddress TEXT NOT NULL,
    productId INTEGER,
    productName TEXT NOT NULL,
    productImage TEXT,
    quantity INTEGER NOT NULL,
    totalAmount REAL NOT NULL,
    gstAmount REAL NOT NULL,
    finalAmount REAL NOT NULL,
    paymentMethod TEXT NOT NULL,
    paymentStatus TEXT NOT NULL DEFAULT 'Pending',
    orderDate TEXT NOT NULL,
    orderTime TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_ownerId ON products(ownerId);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_bills_ownerId ON bills(ownerId);
CREATE INDEX IF NOT EXISTS idx_customers_ownerId ON customers(ownerId);
CREATE INDEX IF NOT EXISTS idx_employees_ownerId ON employees(ownerId);
CREATE INDEX IF NOT EXISTS idx_orders_ownerId ON orders(ownerId);
CREATE INDEX IF NOT EXISTS idx_orders_orderNumber ON orders(orderNumber);
CREATE INDEX IF NOT EXISTS idx_bill_items_billId ON bill_items(billId);
