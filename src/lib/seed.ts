import mongoose from 'mongoose';
import { Category } from './models/Category';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env');
  process.exit(1);
}

const categories = [
  { name: 'Dresses', slug: 'dresses', type: 'product' },
  { name: 'Jewelry', slug: 'jewelry', type: 'product' },
  { name: 'Accessories', slug: 'accessories', type: 'product' },
  { name: 'Shoes', slug: 'shoes', type: 'product' },
  { name: 'Bags', slug: 'bags', type: 'product' },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB.');

    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        cat,
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`Seeded category: ${cat.name}`);
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seed();
