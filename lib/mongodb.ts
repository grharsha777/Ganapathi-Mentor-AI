/**
 * Safe MongoDB client - does not throw when MONGODB_URI is missing.
 * Use connectSafe() in APIs that need graceful fallback to mock data.
 */
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export function isMongoConfigured(): boolean {
  return !!MONGODB_URI;
}

// Use type assertion for global property access
let cached = (global as any).mongoSafe;

if (!cached) {
  // Use type assertion for global property access
  cached = (global as any).mongoSafe = { conn: null, promise: null };
}

/**
 * Connect to MongoDB. Returns null if MONGODB_URI is not configured.
 * Does not throw - safe for APIs that fall back to mock data.
 */
export async function connectSafe(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) return null;
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).catch(() => {
      cached.promise = null;
      return null;
    });
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch {
    cached.promise = null;
    return null;
  }
}
