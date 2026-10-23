import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA busy_timeout = 5000;');
db.exec('PRAGMA journal_mode = WAL;');

console.log('Inspecting existing tables...');
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
console.log('Tables found:', tables.map(t => t.name));

function getColumns(table) {
  try {
    return db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
  } catch {
    return [];
  }
}

// 1. Owner Profile (Drop CHECK id=1 and add passwordHash)
console.log('Updating owner_profile...');
const ownerCols = getColumns('owner_profile');
console.log('Current owner_profile cols:', ownerCols);

db.exec(`
  CREATE TABLE IF NOT EXISTS owner_profile_new (
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
`);

if (ownerCols.length > 0) {
  const common = ['id', 'ownerName', 'businessName', 'email', 'gstNumber', 'address', 'mobile', 'website', 'upi', 'bankAccount', 'ifsc']
    .filter(c => ownerCols.includes(c));
  const colsList = common.join(', ');
  db.exec(`INSERT OR IGNORE INTO owner_profile_new (${colsList}) SELECT ${colsList} FROM owner_profile;`);
  db.exec(`DROP TABLE owner_profile;`);
}
db.exec(`ALTER TABLE owner_profile_new RENAME TO owner_profile;`);

// 2. Customer Profiles
console.log('Updating customer_profiles...');
db.exec(`
  CREATE TABLE IF NOT EXISTS customer_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    address TEXT,
    passwordHash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);
const custProfCols = getColumns('customer_profiles');
if (!custProfCols.includes('passwordHash')) {
  db.exec('ALTER TABLE customer_profiles ADD COLUMN passwordHash TEXT;');
}

// 3. Products
console.log('Updating products...');
const prodCols = getColumns('products');
if (!prodCols.includes('ownerId')) {
  console.log('Adding ownerId to products table...');
  db.exec('ALTER TABLE products ADD COLUMN ownerId INTEGER REFERENCES owner_profile(id) ON DELETE CASCADE;');
  db.exec('UPDATE products SET ownerId = 1 WHERE ownerId IS NULL;');
}

// 4. Customers CRM
console.log('Updating customers CRM...');
const custCols = getColumns('customers');
if (!custCols.includes('ownerId')) {
  console.log('Adding ownerId to customers table...');
  db.exec('ALTER TABLE customers ADD COLUMN ownerId INTEGER REFERENCES owner_profile(id) ON DELETE CASCADE;');
  db.exec('UPDATE customers SET ownerId = 1 WHERE ownerId IS NULL;');
}

// 5. Employees
console.log('Updating employees...');
const empCols = getColumns('employees');
if (!empCols.includes('ownerId')) {
  console.log('Adding ownerId to employees table...');
  db.exec('ALTER TABLE employees ADD COLUMN ownerId INTEGER REFERENCES owner_profile(id) ON DELETE CASCADE;');
  db.exec('UPDATE employees SET ownerId = 1 WHERE ownerId IS NULL;');
}

// 6. Bills
console.log('Updating bills...');
const billCols = getColumns('bills');
if (!billCols.includes('ownerId')) {
  console.log('Adding ownerId to bills table...');
  db.exec('ALTER TABLE bills ADD COLUMN ownerId INTEGER REFERENCES owner_profile(id) ON DELETE CASCADE;');
  db.exec('UPDATE bills SET ownerId = 1 WHERE ownerId IS NULL;');
}

// 7. Orders
console.log('Updating orders...');
const orderCols = getColumns('orders');
if (!orderCols.includes('ownerId')) {
  console.log('Adding ownerId to orders table...');
  db.exec('ALTER TABLE orders ADD COLUMN ownerId INTEGER REFERENCES owner_profile(id);');
  db.exec('UPDATE orders SET ownerId = 1 WHERE ownerId IS NULL;');
}

// 8. Create Indexes
console.log('Creating indexes...');
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_products_ownerId ON products(ownerId);
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  CREATE INDEX IF NOT EXISTS idx_bills_ownerId ON bills(ownerId);
  CREATE INDEX IF NOT EXISTS idx_customers_ownerId ON customers(ownerId);
  CREATE INDEX IF NOT EXISTS idx_employees_ownerId ON employees(ownerId);
  CREATE INDEX IF NOT EXISTS idx_orders_ownerId ON orders(ownerId);
  CREATE INDEX IF NOT EXISTS idx_orders_orderNumber ON orders(orderNumber);
`);

console.log('Migration successfully completed!');
db.close();
