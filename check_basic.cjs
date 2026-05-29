
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

async function checkConnections() {
  console.log('--- Fashcon Connection Audit (Basic) ---');

  // 1. MongoDB Connection
  try {
    console.log('Testing MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB: Connected successfully.');
    await mongoose.connection.close();
  } catch (err) {
    console.log('❌ MongoDB: Connection failed.', err.message);
  }

  // 2. Cloudinary Connection
  try {
    console.log('Testing Cloudinary...');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary: Connected successfully (Ping: OK).');
  } catch (err) {
    console.log('❌ Cloudinary: Connection failed.', err.message);
  }

  console.log('--- Audit Complete ---');
  process.exit(0);
}

checkConnections();
