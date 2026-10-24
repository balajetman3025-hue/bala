import crypto from 'node:crypto';

/**
 * Hash a plain-text password using Node.js native scrypt.
 * Output format: <salt_hex>:<derived_key_hex>
 */
export function hashPassword(plainTextPassword) {
  if (!plainTextPassword) return null;
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(String(plainTextPassword), salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a plain-text password against a stored <salt>:<hash> string.
 * Supports backward-compatibility for legacy unhashed entries.
 */
export function verifyPassword(plainTextPassword, storedHash) {
  if (!storedHash) return true; // If no password was configured, allow login
  if (!plainTextPassword) return false;

  // Modern salt:hash format
  if (storedHash.includes(':')) {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;

    try {
      const derivedKey = crypto.scryptSync(String(plainTextPassword), salt, 64);
      const keyBuffer = Buffer.from(key, 'hex');
      if (derivedKey.length !== keyBuffer.length) return false;
      return crypto.timingSafeEqual(derivedKey, keyBuffer);
    } catch {
      return false;
    }
  }

  // Fallback: direct string comparison if legacy plain text password
  return plainTextPassword === storedHash;
}
