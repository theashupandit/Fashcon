import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from subdomain/admin/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('--- ENV VALUES RECEIVED ---');
console.log('NEXT_PUBLIC_ADMIN_EMAIL:', JSON.stringify(process.env.NEXT_PUBLIC_ADMIN_EMAIL));
console.log('MONGODB_URI:', JSON.stringify(process.env.MONGODB_URI));

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('No MONGODB_URI found!');
  process.exit(1);
}

console.log('Attempting connection...');
try {
  // Try connecting with raw URI
  await mongoose.connect(uri);
  console.log('SUCCESS: Connected to MongoDB successfully!');
  await mongoose.disconnect();
} catch (err) {
  console.error('FAILURE: Connection failed with error:', err.message);
  
  // Try connecting with stripped quotes
  const strippedUri = uri.replace(/^"|"$/g, '');
  console.log('Stripped MONGODB_URI:', JSON.stringify(strippedUri));
  console.log('Attempting connection with stripped URI...');
  try {
    await mongoose.connect(strippedUri);
    console.log('SUCCESS: Connected to MongoDB with stripped URI!');
    await mongoose.disconnect();
  } catch (err2) {
    console.error('FAILURE: Stripped connection also failed:', err2.message);
  }
}
