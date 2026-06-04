const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const ProductSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });

async function run() {
  await mongoose.connect(MONGODB_URI);
  const Product = mongoose.model('Product', ProductSchema);
  
  const id1 = '6a1ab2ace2fd8c8e19f21d71';
  const id2 = '6a1ab2b9e2fd8c8e19f21d77';
  
  const res1 = await Product.findByIdAndUpdate(id1, {
    status: 'published',
    category: "women's-clothing"
  }, { new: true });
  
  const res2 = await Product.findByIdAndUpdate(id2, {
    status: 'published',
    category: "women's-clothing"
  }, { new: true });
  
  console.log("Updated Product 1:");
  console.log(`Title: ${res1.get('title')}, Status: ${res1.get('status')}, Category: ${res1.get('category')}`);
  
  console.log("Updated Product 2:");
  console.log(`Title: ${res2.get('title')}, Status: ${res2.get('status')}, Category: ${res2.get('category')}`);
  
  process.exit(0);
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
