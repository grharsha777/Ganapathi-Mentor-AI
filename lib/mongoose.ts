import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Use type assertion for global property access
let cached = (global as any).mongoose;

if (!cached) {
    // Use type assertion for global property access
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log("Successfully connected to MongoDB");
    } catch (e: any) {
        console.error("MongoDB connection error:", {
            message: e.message,
            code: e.code,
            name: e.name
        });
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectToDatabase;
