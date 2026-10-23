import db from './db.js';

export function runSeed(force = false) {
  const existingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get();
  
  if (!force && existingProducts && existingProducts.count > 0) {
    console.log('Database already contains data. Skipping seed.');
    return;
  }

  console.log('Seeding SQL database with initial data...');

  const insertOwner = db.prepare(`
    INSERT OR REPLACE INTO owner_profile (
      id, ownerName, businessName, gstNumber, address, mobile, email, website, upi, bankAccount, ifsc
    ) VALUES (
      1,
      'Rajesh Sharma',
      'MERIDUKAN Super Store',
      '09AAECR1234F1Z8',
      'Shop No. 12, Alpha Commercial Complex, Greater Noida, UP - 201308',
      '+91 9876543210',
      'owner@meridukan.com',
      'https://meridukan.com',
      'meridukan@okhdfcbank',
      '50100234567890',
      'HDFC0001234'
    )
  `);

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, productName, description, company, category, barcode, purchasePrice, sellingPrice, quantity, gst, image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCustomer = db.prepare(`
    INSERT INTO customers (
      id, name, mobile, address, totalPurchases, totalOrders, lastVisited
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEmployee = db.prepare(`
    INSERT INTO employees (
      id, name, role, mobile, salary, status, joinDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertBill = db.prepare(`
    INSERT INTO bills (
      id, invoiceNumber, customerName, customerMobile, customerAddress, date, time, subTotal, gstAmount, grandTotal, paymentMode
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertBillItem = db.prepare(`
    INSERT INTO bill_items (
      id, billId, productId, productName, quantity, price, gstPercent, total
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, orderNumber, customerName, customerMobile, customerAddress, productId, productName, productImage, quantity, totalAmount, gstAmount, finalAmount, paymentMethod, paymentStatus, orderDate, orderTime
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    insertOwner.run();

    const products = [
      [1, 'Aashirvaad Shudh Chakki Atta (5kg)', '100% pure whole wheat flour processed with traditional chakki process.', 'ITC Limited', 'Groceries', '8901030384912', 220, 260, 45, 5, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60'],
      [2, 'Tata Salt Vaccum Evaporated (1kg)', 'Desh Ka Namak with essential iodine nutrients for daily family consumption.', 'Tata Consumer Products', 'Groceries', '8901058852370', 20, 28, 120, 0, 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=500&auto=format&fit=crop&q=60'],
      [3, 'Amul Butter Pasteurised (500g)', 'Utterly Butterly Delicious pure pasteurized salted cream butter.', 'GCMMF (Amul)', 'Dairy', '8901262010052', 240, 275, 32, 12, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=60'],
      [4, 'Fortune Sunlite Refined Sunflower Oil (1L)', 'Light and healthy refined cooking oil enriched with vitamins A & D.', 'Adani Wilmar', 'Cooking Oils', '8906007280145', 125, 155, 60, 5, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60'],
      [5, 'boAt Rockerz 255 Pro+ Wireless Earphones', 'Bluetooth in-ear neckband with ASAP fast charge and 40H playback time.', 'boAt Lifestyle', 'Electronics', '8904330901289', 950, 1299, 18, 18, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'],
      [6, 'Dettol Original Antiseptic Liquid (550ml)', 'Effective antiseptic liquid for first aid, surface disinfection, and hygiene.', 'Reckitt Benckiser', 'Personal Care', '8901396112001', 180, 215, 25, 18, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'],
      [7, 'Nescafe Classic Instant Coffee Jar (100g)', '100% pure rich instant coffee made with carefully selected robusta beans.', 'Nestle India', 'Beverages', '8901058860016', 260, 320, 40, 18, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=60'],
      [8, 'Cadbury Dairy Milk Silk Chocolate (150g)', 'Creamy and smooth chocolate bar melt-in-mouth confection.', 'Mondelez International', 'Snacks & Confectionery', '7622201412015', 140, 175, 50, 18, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=60']
    ];
    for (const p of products) {
      insertProduct.run(...p);
    }

    const customers = [
      [1, 'Amit Verma', '+91 9811223344', 'B-402, Gaur City 1, Greater Noida West', 4520, 6, '2026-08-26'],
      [2, 'Pooja Agarwal', '+91 9712345678', 'Flat 12B, Jaypee Greens, Noida', 1807, 1, '2026-08-27'],
      [3, 'Vikram Singh', '+91 9988776655', 'Sector 62, Noida, Uttar Pradesh', 9450, 12, '2026-08-25'],
      [4, 'Neha Sharma', '+91 9456123789', 'Expressway Towers, Greater Noida', 3120, 4, '2026-08-24']
    ];
    for (const c of customers) {
      insertCustomer.run(...c);
    }

    const employees = [
      [1, 'Suresh Kumar', 'Store Manager', '+91 9871100223', 28000, 'Active', '2024-03-15'],
      [2, 'Ravi Prakash', 'Billing & Cashier', '+91 9819922334', 19000, 'Active', '2024-08-01'],
      [3, 'Mohit Yadav', 'Inventory Assistant', '+91 9910033445', 16000, 'Active', '2025-01-10']
    ];
    for (const e of employees) {
      insertEmployee.run(...e);
    }

    const bills = [
      [101, 'INV-2026-001', 'Amit Verma', '+91 9811223344', 'B-402, Gaur City 1, Greater Noida West', '2026-08-26', '11:30 AM', 840, 72.8, 912.8, 'UPI'],
      [102, 'INV-2026-002', 'Pooja Agarwal', '+91 9712345678', 'Flat 12B, Jaypee Greens, Noida', '2026-08-27', '09:45 AM', 1574, 233.82, 1807.82, 'Cash']
    ];
    for (const b of bills) {
      insertBill.run(...b);
    }

    const billItems = [
      [1, 101, 1, 'Aashirvaad Shudh Chakki Atta (5kg)', 2, 260, 5, 520],
      [2, 101, 7, 'Nescafe Classic Instant Coffee Jar (100g)', 1, 320, 18, 320],
      [3, 102, 5, 'boAt Rockerz 255 Pro+ Wireless Earphones', 1, 1299, 18, 1299],
      [4, 102, 3, 'Amul Butter Pasteurised (500g)', 1, 275, 12, 275]
    ];
    for (const bi of billItems) {
      insertBillItem.run(...bi);
    }

    const orders = [
      [501, 'ORD-9482', 'Priya Mehta', '+91 9820011223', 'Tower 4, Ace City, Greater Noida West', 1, 'Aashirvaad Shudh Chakki Atta (5kg)', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60', 2, 520, 26, 546, 'UPI', 'Paid', '2026-08-27', '10:15 AM']
    ];
    for (const o of orders) {
      insertOrder.run(...o);
    }

    db.exec('COMMIT');
    console.log('Seed completed successfully!');
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Failed to seed database:', err);
    throw err;
  }
}

// If executed directly
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed(process.argv.includes('--force'));
}
