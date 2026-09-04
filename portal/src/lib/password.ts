import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEYLEN = 64;

/**
 * Password hashing on Node's own scrypt.
 *
 * scrypt is memory-hard and ships with Node, which keeps a native build step
 * (bcrypt/argon2) out of the on-prem Docker image. Format is
 * `scrypt$<salt-hex>$<hash-hex>` so the parameters travel with the hash.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEYLEN);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const derived = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);

  // Lengths must match before timingSafeEqual, which throws on a mismatch.
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

/** Minimum bar for an internally-provisioned account. */
export function passwordProblem(password: string): string | null {
  if (password.length < 10) return 'Password must be at least 10 characters.';
  if (!/[a-z]/i.test(password)) return 'Password must contain a letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain a number.';
  return null;
}
