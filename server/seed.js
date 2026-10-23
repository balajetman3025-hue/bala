import db from './db.js';

export function runSeed(forceDemo = false) {
  // Only seed demo data if explicitly requested via command line flag --demo
  if (!forceDemo) {
    return;
  }

  console.log('Inserting sample demo data...');

  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, productName, description, company, category, barcode, purchasePrice, sellingPrice, quantity, gst, image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    const products = [
      [1, 'Aashirvaad Shudh Chakki Atta (5kg)', '100% pure whole wheat flour processed with traditional chakki process.', 'ITC Limited', 'Groceries', '8901030384912', 220, 260, 45, 5, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=60'],
      [2, 'Tata Salt Vaccum Evaporated (1kg)', 'Desh Ka Namak with essential iodine nutrients for daily family consumption.', 'Tata Consumer Products', 'Groceries', '8901058852370', 20, 28, 120, 0, 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=500&auto=format&fit=crop&q=60'],
      [3, 'Amul Butter Pasteurised (500g)', 'Utterly Butterly Delicious pure pasteurized salted cream butter.', 'GCMMF (Amul)', 'Dairy', '8901262010052', 240, 275, 32, 12, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=60'],
      [4, 'Fortune Sunlite Refined Sunflower Oil (1L)', 'Light and healthy refined cooking oil enriched with vitamins A & D.', 'Adani Wilmar', 'Cooking Oils', '8906007280145', 125, 155, 60, 5, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60']
    ];
    for (const p of products) {
      insertProduct.run(...p);
    }
    db.exec('COMMIT');
    console.log('Demo seed completed.');
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Failed to seed demo data:', err);
  }
}

// Clear all demo data from all tables
export function clearAllData() {
  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM bill_items;');
    db.exec('DELETE FROM bills;');
    db.exec('DELETE FROM orders;');
    db.exec('DELETE FROM customers;');
    db.exec('DELETE FROM employees;');
    db.exec('DELETE FROM products;');
    db.exec('DELETE FROM customer_profiles;');
    db.exec('DELETE FROM owner_profile;');
    db.exec('DELETE FROM sqlite_sequence;');
    db.exec('COMMIT');
    console.log('All demo data cleared. Clean slate created.');
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Failed to clear data:', err);
  }
}

if (process.argv.includes('--clear')) {
  clearAllData();
} else if (process.argv.includes('--demo')) {
  runSeed(true);
}
