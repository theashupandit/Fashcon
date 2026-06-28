import 'dotenv/config';
import mongoose from 'mongoose';
import { getCategories } from '../src/app/actions/categories';

async function verify() {
  console.log('Testing categories fetch with the fixed categories.ts Action...');
  try {
    console.log('MONGODB_URI loaded:', process.env.MONGODB_URI ? 'Yes (starts with ' + process.env.MONGODB_URI.substring(0, 15) + '...)' : 'No');
    const categories = await getCategories();
    console.log(`SUCCESS: Fetched ${categories.length} categories.`);
    
    // Find Skincare category specifically
    const skincare = categories.find((c: any) => c.slug === 'skincare');
    console.log('Skincare Category Details from DB:');
    console.log(JSON.stringify(skincare, null, 2));
    
  } catch (err: any) {
    console.error('FAILURE: Error while running getCategories:', err.message, err.stack);
  } finally {
    await mongoose.disconnect();
  }
}

verify();
