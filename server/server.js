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
// 1. AUTHENTICATION & PASSWORDS (OWNER)
// ==========================================
app.post('/api/auth/owner/register', (req, res) => {
  try {
    const { ownerName, businessName, email, password, mobile, address, gstNumber, website, upi, bankAccount, ifsc } = req.body;
    if (!ownerName || !businessName || !email) {
      return res.status(400).json({ error: 'Owner name, business name, and email are required.' });
    }

    const passwordHash = password ? hashPassword(password) : null;

    db.prepare(`
      INSERT INTO owner_profile (id, ownerName, businessName, gstNumber, address, mobile, email, website, upi, bankAccount, ifsc, passwordHash, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        ownerName = excluded.ownerName,
        businessName = excluded.businessName,
        gstNumber = excluded.gstNumber,
        address = excluded.address,
        mobile = excluded.mobile,
        email = excluded.email,
        website = excluded.website,
        upi = excluded.upi,
        bankAccount = excluded.bankAccount,
        ifsc = excluded.ifsc,
        passwordHash = COALESCE(excluded.passwordHash, owner_profile.passwordHash),
        updated_at = CURRENT_TIMESTAMP
    `).run(ownerName, businessName, gstNumber || '', address || '', mobile || '', email, website || '', upi || '', bankAccount || '', ifsc || '', passwordHash);

    const profile = db.prepare('SELECT id, ownerName, businessName, gstNumber, address, mobile, email, website, upi, bankAccount, ifsc FROM owner_profile WHERE id = 1').get();
    res.status(201).json(profile);
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

    const owner = db.prepare('SELECT * FROM owner_profile WHERE email = ? OR id = 1').get(email);
    if (!owner) {
      return res.status(401).json({ error: 'No owner profile registered. Please register first.' });
    }

    // If an owner account has a passwordHash, verify it with timing-safe comparison
    if (owner.passwordHash) {
      const isValid = verifyPassword(password, owner.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    // Do not return passwordHash in the response
    const { passwordHash: _, ...safeProfile } = owner;
    res.json(safeProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. AUTHENTICATION & PASSWORDS (CUSTOMER)
// ==========================================
app.post('/api/auth/customer/register', (req, res) => {
  try {
    const { customerName, mobile, email, password, address } = req.body;
    if (!customerName || !mobile) {
      return res.status(400).json({ error: 'Customer name and mobile number are required.' });
    }

    const existing = db.prepare('SELECT * FROM customer_profiles WHERE mobile = ? OR (email IS NOT NULL AND email = ?)').get(mobile, email || null);
    if (existing) {
      return res.status(409).json({ error: 'An account with this mobile or email already exists.' });
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
    const identifier = email || mobile;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/mobile and password are required.' });
    }

    const customer = db.prepare('SELECT * FROM customer_profiles WHERE email = ? OR mobile = ?').get(identifier, identifier);
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
// 3. OWNER PROFILE
// ==========================================
app.get('/api/profile', (req, res) => {
  try {
    const profile = db.prepare('SELECT id, ownerName, businessName, gstNumber, address, mobile, email, website, upi, bankAccount, ifsc FROM owner_profile WHERE id = 1').get();
    if (!profile) {
      return res.status(404).json({ error: 'Owner profile not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profile', (req, res) => {
  try {
    const { ownerName, businessName, gstNumber, address, mobile, email, website, upi, bankAccount, ifsc, password } = req.body;
    const newHash = password ? hashPassword(password) : null;

    db.prepare(`
      INSERT INTO owner_profile (id, ownerName, businessName, gstNumber, address, mobile, email, website, upi, bankAccount, ifsc, passwordHash, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        ownerName = excluded.ownerName,
        businessName = excluded.businessName,
        gstNumber = excluded.gstNumber,
        address = excluded.address,
        mobile = excluded.mobile,
        email = excluded.email,
        website = excluded.website,
        upi = excluded.upi,
        bankAccount = excluded.bankAccount,
        ifsc = excluded.ifsc,
        passwordHash = COALESCE(?, owner_profile.passwordHash),
        updated_at = CURRENT_TIMESTAMP
    `).run(ownerName, businessName, gstNumber, address, mobile, email, website, upi, bankAccount, ifsc, newHash, newHash);

    const updated = db.prepare('SELECT id, ownerName, businessName, gstNumber, address, mobile, email, website, upi, bankAccount, ifsc FROM owner_profile WHERE id = 1').get();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. PRODUCTS
// ==========================================
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { productName, description, company, category, barcode, purchasePrice, sellingPrice, quantity, gst, image } = req.body;
    const stmt = db.prepare(`
      INSERT INTO products (productName, description, company, category, barcode, purchasePrice, sellingPrice, quantity, gst, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      image || ''
    );
    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(info.lastInsertRowid));
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
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
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
// 5. BILLS & POS INVOICING
// ==========================================
app.get('/api/bills', (req, res) => {
  try {
    const bills = db.prepare('SELECT * FROM bills ORDER BY id DESC').all();
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

app.get('/api/bills/:id', (req, res) => {
  try {
    const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    const items = db.prepare('SELECT * FROM bill_items WHERE billId = ?').all(bill.id);
    res.json({ ...bill, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bills', (req, res) => {
  try {
    const {
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

    db.exec('BEGIN');
    try {
      const billStmt = db.prepare(`
        INSERT INTO bills (invoiceNumber, customerName, customerMobile, customerAddress, date, time, subTotal, gstAmount, grandTotal, paymentMode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const billResult = billStmt.run(
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

      // Update or create customer record
      if (customerMobile) {
        const existingCust = db.prepare('SELECT * FROM customers WHERE mobile = ?').get(customerMobile);
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
            INSERT INTO customers (name, mobile, address, totalPurchases, totalOrders, lastVisited)
            VALUES (?, ?, ?, ?, 1, ?)
          `).run(customerName, customerMobile, customerAddress || '', Number(grandTotal) || 0, date || new Date().toISOString().split('T')[0]);
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
// 6. CUSTOMERS CRM
// ==========================================
app.get('/api/customers', (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM customers ORDER BY totalPurchases DESC').all();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', (req, res) => {
  try {
    const { name, mobile, address, totalPurchases, totalOrders, lastVisited } = req.body;
    const stmt = db.prepare(`
      INSERT INTO customers (name, mobile, address, totalPurchases, totalOrders, lastVisited)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
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
// 7. EMPLOYEES
// ==========================================
app.get('/api/employees', (req, res) => {
  try {
    const employees = db.prepare('SELECT * FROM employees ORDER BY id ASC').all();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', (req, res) => {
  try {
    const { name, role, mobile, salary, status, joinDate } = req.body;
    const stmt = db.prepare(`
      INSERT INTO employees (name, role, mobile, salary, status, joinDate)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
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
// 8. ONLINE CUSTOMER ORDERS
// ==========================================
app.get('/api/orders', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
    const formatted = orders.map(ord => ({
      id: ord.id,
      orderNumber: ord.orderNumber,
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
      customerName,
      customerMobile,
      customerAddress,
      product,
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

    db.exec('BEGIN');
    try {
      const stmt = db.prepare(`
        INSERT INTO orders (
          orderNumber, customerName, customerMobile, customerAddress, productId, productName, productImage, quantity, totalAmount, gstAmount, finalAmount, paymentMethod, paymentStatus, orderDate, orderTime
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const info = stmt.run(
        ordNum,
        customerName,
        customerMobile,
        customerAddress,
        product?.id || null,
        product?.productName || 'Order Item',
        product?.image || '',
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
      if (product?.id) {
        db.prepare('UPDATE products SET quantity = MAX(0, quantity - ?) WHERE id = ?').run(Number(quantity) || 1, product.id);
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

// ==========================================
// 9. DATABASE BACKUP & RESTORE (JSON)
// ==========================================
app.get('/api/backup', (req, res) => {
  try {
    const backup = {
      ownerProfile: db.prepare('SELECT id, ownerName, businessName, gstNumber, address, mobile, email, website, upi, bankAccount, ifsc FROM owner_profile WHERE id = 1').get(),
      products: db.prepare('SELECT * FROM products').all(),
      customers: db.prepare('SELECT * FROM customers').all(),
      employees: db.prepare('SELECT * FROM employees').all(),
      bills: db.prepare('SELECT * FROM bills').all(),
      billItems: db.prepare('SELECT * FROM bill_items').all(),
      orders: db.prepare('SELECT * FROM orders').all(),
      exportedAt: new Date().toISOString()
    };
    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/restore', (req, res) => {
  try {
    const data = req.body;
    db.exec('BEGIN');
    try {
      if (data.ownerProfile) {
        const p = data.ownerProfile;
        db.prepare(`
          INSERT OR REPLACE INTO owner_profile (id, ownerName, businessName, gstNumber, address, mobile, email, website, upi, bankAccount, ifsc)
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(p.ownerName, p.businessName, p.gstNumber, p.address, p.mobile, p.email, p.website, p.upi, p.bankAccount, p.ifsc);
      }
      if (Array.isArray(data.products)) {
        db.prepare('DELETE FROM products').run();
        const pStmt = db.prepare(`INSERT INTO products (id, productName, description, company, category, barcode, purchasePrice, sellingPrice, quantity, gst, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const p of data.products) {
          pStmt.run(p.id, p.productName, p.description, p.company, p.category, p.barcode, p.purchasePrice, p.sellingPrice, p.quantity, p.gst, p.image);
        }
      }
      if (Array.isArray(data.customers)) {
        db.prepare('DELETE FROM customers').run();
        const cStmt = db.prepare(`INSERT INTO customers (id, name, mobile, address, totalPurchases, totalOrders, lastVisited) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        for (const c of data.customers) {
          cStmt.run(c.id, c.name, c.mobile, c.address, c.totalPurchases, c.totalOrders, c.lastVisited);
        }
      }
      if (Array.isArray(data.employees)) {
        db.prepare('DELETE FROM employees').run();
        const eStmt = db.prepare(`INSERT INTO employees (id, name, role, mobile, salary, status, joinDate) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        for (const e of data.employees) {
          eStmt.run(e.id, e.name, e.role, e.mobile, e.salary, e.status, e.joinDate);
        }
      }
      if (Array.isArray(data.bills)) {
        db.prepare('DELETE FROM bill_items').run();
        db.prepare('DELETE FROM bills').run();
        const bStmt = db.prepare(`INSERT INTO bills (id, invoiceNumber, customerName, customerMobile, customerAddress, date, time, subTotal, gstAmount, grandTotal, paymentMode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const b of data.bills) {
          bStmt.run(b.id, b.invoiceNumber, b.customerName, b.customerMobile, b.customerAddress, b.date, b.time, b.subTotal, b.gstAmount, b.grandTotal, b.paymentMode);
        }
      }
      if (Array.isArray(data.billItems)) {
        const biStmt = db.prepare(`INSERT INTO bill_items (id, billId, productId, productName, quantity, price, gstPercent, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const bi of data.billItems) {
          biStmt.run(bi.id, bi.billId, bi.productId, bi.productName, bi.quantity, bi.price, bi.gstPercent, bi.total);
        }
      }
      db.exec('COMMIT');
      res.json({ success: true, message: 'Database restored successfully' });
    } catch (txErr) {
      db.exec('ROLLBACK');
      throw txErr;
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`MERIDUKAN Backend Server running on http://localhost:${PORT}`);
});
