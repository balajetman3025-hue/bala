# MERIDUKAN — Retail Shop & Business Management Web App

A full-featured, full-stack responsive React & Express application delivering complete business management, point of sale (POS) billing, GST invoicing, inventory tracking, customer accounts, and order management backed by a real SQL (SQLite) database.

---

## 🚀 Key Features

### 🏪 Store Owner Portal
- **Dashboard & Quick Actions**: Direct shortcuts for Billing, Inventory, Customers, Staff, Reports, and Store Settings.
- **Product & Inventory Management**:
  - Add, edit, and delete products with image upload, barcode, MRP, Purchase Price, Selling Price, and GST rates.
  - Automatic inventory stock decrementing on POS billing and customer orders.
  - Low stock warning badges and category classification.
- **POS Billing & Invoicing**:
  - Instant bill generator with customer selector and product lookup.
  - Automatic SGST + CGST calculation and multi-payment support (Cash, UPI, Card).
  - Printable professional GST tax invoices.
- **Customer CRM**: Complete customer directory with contact details, address, purchase counts, and spend totals.
- **Staff & Employees**: Employee roster with role designation, payroll tracking, and status.
- **Reports & Analytics**: Daily sales, total revenue, tax receipts, category inventory valuation, and stock alerts.
- **Settings & SQL Backup**: Full database backup and restore (JSON), store credentials, and bank account setup.

### 🛍️ Customer Portal
- **Product Catalog**: Explore store items with category filtering and real-time search.
- **Product Details & Buying Flow**: Detailed specs, GST rates, and dynamic quantity selector.
- **Integrated Payment Gateway**: Support for UPI, Cash on Delivery, Card, and Net Banking.
- **Purchase History**: View past orders and print order receipts.
- **Customer Support**: Direct phone, email, operating hours, and inquiry submission.

---

## 🛠️ Architecture & Tech Stack

```
┌──────────────────────────────────────────────┐
│            Frontend (Port 3000)              │
│       React 18 + Vite + Tailwind CSS v4      │
│  src/api.ts (Type-safe client) + AppContext  │
└──────────────────────┬───────────────────────┘
                       │ HTTP REST API (JSON)
                       ▼
┌──────────────────────────────────────────────┐
│             Backend (Port 5000)              │
│            Node.js + Express.js              │
│  server/server.js (REST routes & validation) │
└──────────────────────┬───────────────────────┘
                       │ Native SQL Statements
                       ▼
┌──────────────────────────────────────────────┐
│           SQL Database (SQLite)              │
│            server/database.sqlite            │
│  Tables: products, bills, bill_items,        │
│          customers, employees, orders,       │
│          owner_profile, customer_profiles    │
└──────────────────────────────────────────────┘
```

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **Backend**: Express.js REST API (`server/server.js`)
- **Database**: Native Node.js SQLite (`server/database.sqlite`, `server/schema.sql`)
- **Persistence**: ACID-compliant SQL transactions with automatic stock updates

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Run Backend & Frontend Concurrently
```bash
npm run dev:all
```
This automatically starts:
- 🚀 **Backend API**: `http://localhost:5000`
- 🌐 **Frontend Web App**: `http://localhost:3000`

### 3. Run Individually (Optional)
```bash
# Start backend only
npm run server:dev

# Start frontend only
npm run dev

# Re-seed the SQL database with sample store data
npm run seed
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status and server timestamp |
| `GET` | `/api/profile` | Get store owner profile |
| `PUT` | `/api/profile` | Update store owner profile & GST details |
| `GET` | `/api/products` | Retrieve all inventory products |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/:id` | Update an existing product |
| `DELETE` | `/api/products/:id` | Delete a product from inventory |
| `GET` | `/api/bills` | List all POS invoices with line items |
| `POST` | `/api/bills` | Create invoice & automatically decrement stock |
| `DELETE` | `/api/bills/:id` | Void / delete an invoice |
| `GET` | `/api/customers` | Get customer CRM records |
| `POST` | `/api/customers` | Add customer record |
| `DELETE` | `/api/customers/:id` | Delete customer |
| `GET` | `/api/employees` | List staff and payroll records |
| `POST` | `/api/employees` | Add staff member |
| `DELETE` | `/api/employees/:id` | Remove employee |
| `GET` | `/api/orders` | Get online customer orders |
| `POST` | `/api/orders` | Place online customer order |
| `GET` | `/api/backup` | Full JSON export of SQL database |
| `POST` | `/api/restore` | Restore SQL database from JSON payload |
