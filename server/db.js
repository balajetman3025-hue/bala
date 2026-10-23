import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new DatabaseSync(dbPath);

// Prevent "database is locked" errors by setting busy_timeout and WAL mode
try {
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  console.warn('Pragma configuration warning:', e.message);
}

// Automatically apply schema if needed
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
}

// Auto-migration columns for multi-owner support if upgrading existing DB
const migrations = [
  'ALTER TABLE products ADD COLUMN ownerId INTEGER REFERENCES owner_profile(id);',
  'ALTER TABLE bills ADD COLUMN ownerId INTEGER REFERENCES owner_profile(id);',
  'ALTER TABLE customers ADD COLUMN ownerId INTEGER REFERENCES owner_profile(id);',
  'ALTER TABLE employees ADD COLUMN ownerId INTEGER REFERENCES owner_profile(id);',
  'ALTER TABLE orders ADD COLUMN ownerId INTEGER REFERENCES owner_profile(id);',
  'ALTER TABLE owner_profile ADD COLUMN passwordHash TEXT;',
  'ALTER TABLE customer_profiles ADD COLUMN passwordHash TEXT;'
];

for (const sql of migrations) {
  try {
    db.exec(sql);
  } catch {
    // Column already exists or table freshly created
  }
}

export default db;
