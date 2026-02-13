import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Ideally, this key should come from an env var and be 32 bytes hex. 
// For this MVP/Demo setup, if ENCRYPTION_KEY is not set, we'll warn or fallback (BUT unsafe for prod).
// We'll enforce that ENCRYPTION_KEY must be provided in .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; 

// Key must be 32 bytes. If the string is shorter/longer, we should hash it or ensure it's correct.
// We'll assume the user provides a 32-char string or similar which we can convert to buffer.
// For robustness:
const getKey = () => {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }
  // Create a 32 byte key from the input
  // If input is hex, use it. If simply text, hash it to 32 bytes.
  return Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)); // Simple padding for now
};

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Return IV + Encrypted text
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  if (!text) return '';
  const textParts = text.split(':');
  const ivPart = textParts.shift();
  if (!ivPart) throw new Error('Invalid encrypted text format');
  
  const iv = Buffer.from(ivPart, 'hex');
  const encryptedText = textParts.join(':');
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
