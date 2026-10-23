import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import { hashPassword, verifyPassword } from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MERIDUKAN Backend API', time: new Date().toISOString() });
});

// ==========================================
// 1. OWNER AUTHENTICATION (MULTI-OWNER)
// ==========================================
app.post('/api/auth/owner/register', (req, res) => {
  try {
    const { ownerName, businessName, email, password, mobile, address, gstNumber, website, upi, bankAccount, ifsc } = req.body;
    if (!ownerName || !businessName || !email) {
      return res.status(400).json({ error: 'Owner name, business name, and email are required.' });
    }

    // Check if an owner with this email already exists
    const existing = db.prepare('SELECT id FROM owner_profile WHERE LOWER(email) = LOWER(?)').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An owner account with this email already exists. Please log in.' });
    }

    const passwordHash = password ? hashPassword(password) : null;

    const stmt = db.prepare(`
      INSERT INTO owner_profile (ownerName, businessName, email, passwordHash, gstNumber, address, mobile, website, upi, bankAccount, ifsc)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      ownerName,
      businessName,
      email,
      passwordHash,
      gstNumber || '',
      address || '',
      mobile || '',
      website || '',
      upi || '',
      bankAccount || '',
      ifsc || ''
    );

    const owner = db.prepare('SELECT id, ownerName, businessName, email, gstNumber, address, mobile, website, upi, bankAccount, ifsc FROM owner_profile WHERE id = ?').get(Number(info.lastInsertRowid));
    res.status(201).json(owner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/owner/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const owner = db.prepare('SELECT * FROM owner_profile WHERE LOWER(email) = LOWER(?)').get(email);
    if (!owner) {
      return res.status(401).json({ error: 'No owner account found with this email. Please register.' });
    }

    if (owner.passwordHash) {
      const isValid = verifyPassword(password, owner.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    const { passwordHash: _, ...safeProfile } = owner;
    res.json(safeProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Owner Profile
app.put('/api/profile/:id', (req, res) => {
  try {
    const ownerId = Number(req.params.id);
    const { ownerName, businessName, gstNumber, address, mobile, email, website, upi, bankAccount, ifsc, password } = req.body;

    const existing = db.prepare('SELECT * FROM owner_profile WHERE id = ?').get(ownerId);
    if (!existing) {
      return res.status(404).json({ error: 'Owner profile not found.' });
    }

    const newHash = password ? hashPassword(password) : existing.passwordHash;

    db.prepare(`
      UPDATE owner_profile SET
        ownerName = COALESCE(?, ownerName),
        businessName = COALESCE(?, businessName),
        gstNumber = COALESCE(?, gstNumber),
        address = COALESCE(?, address),
        mobile = COALESCE(?, mobile),
        email = COALESCE(?, email),
        website = COALESCE(?, website),
        upi = COALESCE(?, upi),
        bankAccount = COALESCE(?, bankAccount),
        ifsc = COALESCE(?, ifsc),
        passwordHash = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(ownerName, businessName, gstNumber, address, mobile, email, website, upi, bankAccount, ifsc, newHash, ownerId);

    const updated = db.prepare('SELECT id, ownerName, businessName, email, gstNumber, address, mobile, website, upi, bankAccount, ifsc FROM owner_profile WHERE id = ?').get(ownerId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. CUSTOMER AUTHENTICATION
// ==========================================
app.post('/api/auth/customer/register', (req, res) => {
  try {
    const { customerName, mobile, email, password, address } = req.body;
    if (!customerName || !mobile) {
      return res.status(400).json({ error: 'Customer name and mobile number are required.' });
    }

    const existing = db.prepare('SELECT * FROM customer_profiles WHERE mobile = ? OR (email IS NOT NULL AND email = ?)').get(mobile, email || null);
    if (existing) {
      return res.status(409).json({ error: 'An account with this mobile or email already exists. Please log in.' });
    }

    const passwordHash = password ? hashPassword(password) : null;
    const stmt = db.prepare(`
      INSERT INTO customer_profiles (customerName, mobile, email, address, passwordHash)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(customerName, mobile, email || '', address || '', passwordHash);

    const created = db.prepare('SELECT id, customerName, mobile, email, address FROM customer_profiles WHERE id = ?').get(Number(info.lastInsertRowid));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/customer/login', (req, res) => {
  try {
    const { email, mobile, password } = req.body;
    const identifier = (email || mobile || '').trim();
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/mobile and password are required.' });
    }

    const customer = db.prepare('SELECT * FROM customer_profiles WHERE LOWER(email) = LOWER(?) OR mobile = ?').get(identifier, identifier);
    if (!customer) {
      return res.status(401).json({ error: 'Customer account not found. Please register.' });
    }

    if (customer.passwordHash) {
      const isValid = verifyPassword(password, customer.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email/mobile or password.' });
      }
    }

    const { passwordHash: _, ...safeProfile } = customer;
    res.json(safeProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. PRODUCTS
// Point 1: Owner gets only their products (?ownerId=X)
// Point 2: Customers see ALL products from ALL owners (no ownerId)
// ==========================================
app.get('/api/products', (req, res) => {
  try {
    const { ownerId } = req.query;
    let products;
    if (ownerId) {
      products = db.prepare(`
        SELECT p.*, o.businessName as storeName 
        FROM products p 
        LEFT JOIN owner_profile o ON p.ownerId = o.id 
        WHERE p.ownerId = ? 
        ORDER BY p.id DESC
      `).all(Number(ownerId));
    } else {
      // Customer view: see products across all store owners!
      products = db.prepare(`
        SELECT p.*, o.businessName as storeName 
        FROM products p 
        LEFT JOIN owner_profile o ON p.ownerId = o.id 
        ORDER BY p.id DESC
      `).all();
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { ownerId, productName, description, company, category, barcode, purchasePrice, sellingPrice, quantity, gst, image } = req.body;
    if (!productName) {
      return res.status(400).json({ error: 'Product name is required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO products (ownerId, productName, description, company, category, barcode, purchasePrice, sellingPrice, quantity, gst, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      ownerId ? Number(ownerId) : null,
      productName,
      description || '',
      company || '',
      category || 'General',
      barcode || '',
      Number(purchasePrice) || 0,
      Number(sellingPrice) || 0,
      Number(quantity) || 0,
      Number(gst) || 0,
      image || ''
    );
    const created = db.prepare(`
      SELECT p.*, o.businessName as storeName 
      FROM products p 
      LEFT JOIN owner_profile o ON p.ownerId = o.id 
      WHERE p.id = ?
    `).get(Number(info.lastInsertRowid));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const { productName, description, company, category, barcode, purchasePrice, sellingPrice, quantity, gst, image } = req.body;
    const stmt = db.prepare(`
      UPDATE products SET
        productName = ?,
        description = ?,
        company = ?,
        category = ?,
        barcode = ?,
        purchasePrice = ?,
        sellingPrice = ?,
        quantity = ?,
        gst = ?,
        image = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const info = stmt.run(
      productName,
      description || '',
      company || '',
      category || 'General',
      barcode || '',
      Number(purchasePrice) || 0,
      Number(sellingPrice) || 0,
      Number(quantity) || 0,
      Number(gst) || 0,
      image || '',
      req.params.id
    );
    if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
    const updated = db.prepare('SELECT p.*, o.businessName as storeName FROM products p LEFT JOIN owner_profile o ON p.ownerId = o.id WHERE p.id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. POS BILLS & INVOICING (Scoped to Owner)
// ==========================================
app.get('/api/bills', (req, res) => {
  try {
    const { ownerId } = req.query;
    let bills;
    if (ownerId) {
      bills = db.prepare('SELECT * FROM bills WHERE ownerId = ? ORDER BY id DESC').all(Number(ownerId));
    } else {
      bills = db.prepare('SELECT * FROM bills ORDER BY id DESC').all();
    }
    const getItems = db.prepare('SELECT * FROM bill_items WHERE billId = ?');
    const billsWithItems = bills.map(bill => ({
      ...bill,
      items: getItems.all(bill.id)
    }));
    res.json(billsWithItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bills', (req, res) => {
  try {
    const {
      ownerId,
      invoiceNumber,
      customerName,
      customerMobile,
      customerAddress,
      date,
      time,
      subTotal,
      gstAmount,
      grandTotal,
      paymentMode,
      items
    } = req.body;

    const generatedInv = invoiceNumber || `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const actualOwnerId = ownerId ? Number(ownerId) : null;

    db.exec('BEGIN');
    try {
      const billStmt = db.prepare(`
        INSERT INTO bills (ownerId, invoiceNumber, customerName, customerMobile, customerAddress, date, time, subTotal, gstAmount, grandTotal, paymentMode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const billResult = billStmt.run(
        actualOwnerId,
        generatedInv,
        customerName || 'Walk-in Customer',
        customerMobile || '',
        customerAddress || '',
        date || new Date().toISOString().split('T')[0],
        time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        Number(subTotal) || 0,
        Number(gstAmount) || 0,
        Number(grandTotal) || 0,
        paymentMode || 'Cash'
      );
      const billId = Number(billResult.lastInsertRowid);

      const itemStmt = db.prepare(`
        INSERT INTO bill_items (billId, productId, productName, quantity, price, gstPercent, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const updateStockStmt = db.prepare(`
        UPDATE products SET quantity = MAX(0, quantity - ?) WHERE id = ?
      `);

      if (Array.isArray(items)) {
        for (const it of items) {
          itemStmt.run(
            billId,
            it.productId || null,
            it.productName,
            Number(it.quantity) || 1,
            Number(it.price) || 0,
            Number(it.gstPercent) || 0,
            Number(it.total) || 0
          );
          if (it.productId) {
            updateStockStmt.run(Number(it.quantity) || 1, it.productId);
          }
        }
      }

      // Point 4: Automatically record customer in owner's CRM
      if (customerMobile && actualOwnerId) {
        const existingCust = db.prepare('SELECT * FROM customers WHERE mobile = ? AND ownerId = ?').get(customerMobile, actualOwnerId);
        if (existingCust) {
          db.prepare(`
            UPDATE customers SET
              totalPurchases = totalPurchases + ?,
              totalOrders = totalOrders + 1,
              lastVisited = ?
            WHERE id = ?
          `).run(Number(grandTotal) || 0, date || new Date().toISOString().split('T')[0], existingCust.id);
        } else {
          db.prepare(`
            INSERT INTO customers (ownerId, name, mobile, address, totalPurchases, totalOrders, lastVisited)
            VALUES (?, ?, ?, ?, ?, 1, ?)
          `).run(actualOwnerId, customerName, customerMobile, customerAddress || '', Number(grandTotal) || 0, date || new Date().toISOString().split('T')[0]);
        }
      }

      db.exec('COMMIT');

      const createdBill = db.prepare('SELECT * FROM bills WHERE id = ?').get(billId);
      const billItems = db.prepare('SELECT * FROM bill_items WHERE billId = ?').all(billId);

      res.status(201).json({ ...createdBill, items: billItems });
    } catch (txErr) {
      db.exec('ROLLBACK');
      throw txErr;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bills/:id', (req, res) => {
  try {
    db.exec('BEGIN');
    try {
      db.prepare('DELETE FROM bill_items WHERE billId = ?').run(req.params.id);
      const info = db.prepare('DELETE FROM bills WHERE id = ?').run(req.params.id);
      db.exec('COMMIT');
      if (info.changes === 0) return res.status(404).json({ error: 'Bill not found' });
      res.json({ success: true, message: 'Bill deleted successfully' });
    } catch (txErr) {
      db.exec('ROLLBACK');
      throw txErr;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. CUSTOMERS CRM (Scoped to Owner)
// Point 1 & Point 4: Owner can see customers who bought from their store!
// ==========================================
app.get('/api/customers', (req, res) => {
  try {
    const { ownerId } = req.query;
    let customers;
    if (ownerId) {
      customers = db.prepare('SELECT * FROM customers WHERE ownerId = ? ORDER BY totalPurchases DESC').all(Number(ownerId));
    } else {
      customers = db.prepare('SELECT * FROM customers ORDER BY totalPurchases DESC').all();
    }
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', (req, res) => {
  try {
    const { ownerId, name, mobile, address, totalPurchases, totalOrders, lastVisited } = req.body;
    const stmt = db.prepare(`
      INSERT INTO customers (ownerId, name, mobile, address, totalPurchases, totalOrders, lastVisited)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      ownerId ? Number(ownerId) : null,
      name,
      mobile,
      address || '',
      Number(totalPurchases) || 0,
      Number(totalOrders) || 0,
      lastVisited || new Date().toISOString().split('T')[0]
    );
    const created = db.prepare('SELECT * FROM customers WHERE id = ?').get(Number(info.lastInsertRowid));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. EMPLOYEES / STAFF (Scoped to Owner)
// ==========================================
app.get('/api/employees', (req, res) => {
  try {
    const { ownerId } = req.query;
    let employees;
    if (ownerId) {
      employees = db.prepare('SELECT * FROM employees WHERE ownerId = ? ORDER BY id ASC').all(Number(ownerId));
    } else {
      employees = db.prepare('SELECT * FROM employees ORDER BY id ASC').all();
    }
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', (req, res) => {
  try {
    const { ownerId, name, role, mobile, salary, status, joinDate } = req.body;
    const stmt = db.prepare(`
      INSERT INTO employees (ownerId, name, role, mobile, salary, status, joinDate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      ownerId ? Number(ownerId) : null,
      name,
      role || 'Staff',
      mobile,
      Number(salary) || 0,
      status || 'Active',
      joinDate || new Date().toISOString().split('T')[0]
    );
    const created = db.prepare('SELECT * FROM employees WHERE id = ?').get(Number(info.lastInsertRowid));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. ONLINE CUSTOMER ORDERS
// Point 4: When customer buys an item from a store, the owner sees the customer!
// ==========================================
app.get('/api/orders', (req, res) => {
  try {
    const { ownerId, customerMobile } = req.query;
    let orders;
    if (ownerId) {
      // Store owner sees orders placed for their store
      orders = db.prepare('SELECT * FROM orders WHERE ownerId = ? ORDER BY id DESC').all(Number(ownerId));
    } else if (customerMobile) {
      // Customer sees their own orders
      orders = db.prepare('SELECT * FROM orders WHERE customerMobile = ? ORDER BY id DESC').all(customerMobile);
    } else {
      orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    }

    const formatted = orders.map(ord => ({
      id: ord.id,
      orderNumber: ord.orderNumber,
      ownerId: ord.ownerId,
      customerName: ord.customerName,
      customerMobile: ord.customerMobile,
      customerAddress: ord.customerAddress,
      quantity: ord.quantity,
      totalAmount: ord.totalAmount,
      gstAmount: ord.gstAmount,
      finalAmount: ord.finalAmount,
      paymentMethod: ord.paymentMethod,
      paymentStatus: ord.paymentStatus,
      orderDate: ord.orderDate,
      orderTime: ord.orderTime,
      product: {
        id: ord.productId,
        productName: ord.productName,
        image: ord.productImage,
        sellingPrice: (ord.totalAmount / (ord.quantity || 1))
      }
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const {
      orderNumber,
      ownerId,
      customerName,
      customerMobile,
      customerAddress,
      product,
      productId,
      productName,
      productImage,
      quantity,
      totalAmount,
      gstAmount,
      finalAmount,
      paymentMethod,
      paymentStatus,
      orderDate,
      orderTime
    } = req.body;

    const ordNum = orderNumber || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const resolvedProductId = product?.id || productId || null;
    const resolvedProductName = product?.productName || productName || 'Order Item';
    const resolvedProductImage = product?.image || productImage || '';

    // Resolve which owner owns this product
    let targetOwnerId = ownerId || product?.ownerId || null;
    if (!targetOwnerId && resolvedProductId) {
      const prodInDb = db.prepare('SELECT ownerId FROM products WHERE id = ?').get(resolvedProductId);
      if (prodInDb) targetOwnerId = prodInDb.ownerId;
    }

    db.exec('BEGIN');
    try {
      const stmt = db.prepare(`
        INSERT INTO orders (
          orderNumber, ownerId, customerName, customerMobile, customerAddress, productId, productName, productImage, quantity, totalAmount, gstAmount, finalAmount, paymentMethod, paymentStatus, orderDate, orderTime
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const info = stmt.run(
        ordNum,
        targetOwnerId,
        customerName || 'Customer',
        customerMobile || '',
        customerAddress || '',
        resolvedProductId,
        resolvedProductName,
        resolvedProductImage,
        Number(quantity) || 1,
        Number(totalAmount) || 0,
        Number(gstAmount) || 0,
        Number(finalAmount) || 0,
        paymentMethod || 'UPI',
        paymentStatus || 'Paid',
        orderDate || new Date().toISOString().split('T')[0],
        orderTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );

      // Decrement product inventory
      if (resolvedProductId) {
        db.prepare('UPDATE products SET quantity = MAX(0, quantity - ?) WHERE id = ?').run(Number(quantity) || 1, resolvedProductId);
      }

      // Point 4: Automatically make this customer visible in the Store Owner's Customer CRM
      if (customerMobile && targetOwnerId) {
        const existingCust = db.prepare('SELECT * FROM customers WHERE mobile = ? AND ownerId = ?').get(customerMobile, targetOwnerId);
        if (existingCust) {
          db.prepare(`
            UPDATE customers SET
              totalPurchases = totalPurchases + ?,
              totalOrders = totalOrders + 1,
              lastVisited = ?
            WHERE id = ?
          `).run(Number(finalAmount) || 0, orderDate || new Date().toISOString().split('T')[0], existingCust.id);
        } else {
          db.prepare(`
            INSERT INTO customers (ownerId, name, mobile, address, totalPurchases, totalOrders, lastVisited)
            VALUES (?, ?, ?, ?, ?, 1, ?)
          `).run(targetOwnerId, customerName || 'Online Customer', customerMobile, customerAddress || '', Number(finalAmount) || 0, orderDate || new Date().toISOString().split('T')[0]);
        }
      }

      db.exec('COMMIT');

      const created = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(info.lastInsertRowid));
      res.status(201).json({
        ...created,
        product: {
          id: created.productId,
          productName: created.productName,
          image: created.productImage,
          sellingPrice: (created.totalAmount / (created.quantity || 1))
        }
      });
    } catch (txErr) {
      db.exec('ROLLBACK');
      throw txErr;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`MERIDUKAN Multi-Owner Backend Server running on http://localhost:${PORT}`);
});
