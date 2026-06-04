const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Using MONGODB_URI:', MONGODB_URI);

const ProductSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });

async function run() {
  await mongoose.connect(MONGODB_URI);
  const Product = mongoose.model('Product', ProductSchema);
  const allProducts = await Product.find({});
  console.log(`Total products in DB: ${allProducts.length}`);
  for (const p of allProducts) {
    console.log(`- ID: ${p._id}, Title: ${p.get('title')}, Status: ${p.get('status')}, isDeleted: ${p.get('isDeleted')}`);
  }
  process.exit(0);
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
