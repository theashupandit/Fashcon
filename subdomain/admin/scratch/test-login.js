import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { loginUser } from '../src/app/actions/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('--- TESTING loginUser ---');
console.log('Env NEXT_PUBLIC_ADMIN_EMAIL:', process.env.NEXT_PUBLIC_ADMIN_EMAIL);
console.log('Env NEXT_PUBLIC_ADMIN_PASSWORD:', process.env.NEXT_PUBLIC_ADMIN_PASSWORD);

try {
  const result = await loginUser('admin@fashcon.store', 'admin_password_123');
  console.log('Result for admin@fashcon.store:', result);
} catch (err) {
  console.error('Error testing admin login:', err);
}

try {
  const result2 = await loginUser('nikhilzone@fashcon.store', 'nikhil@fashcon');
  console.log('Result for nikhilzone@fashcon.store:', result2);
} catch (err) {
  console.error('Error testing nikhilzone login:', err);
}
