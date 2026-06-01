import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashcon';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Register mongoose connection events for logging errors/warnings to terminal
mongoose.connection.on('error', (err) => {
  console.error(`\x1b[31m[DATABASE ERROR]\x1b[0m MongoDB connection error:`, err);
});
mongoose.connection.on('disconnected', () => {
  console.warn(`\x1b[33m[DATABASE WARNING]\x1b[0m MongoDB disconnected.`);
});
mongoose.connection.on('connected', () => {
  console.log(`\x1b[32m[DATABASE INFO]\x1b[0m MongoDB connected successfully.`);
});

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    }
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    console.error(`\x1b[31m[DATABASE ERROR]\x1b[0m Failed to resolve MongoDB connection promise:`, e.message || e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
