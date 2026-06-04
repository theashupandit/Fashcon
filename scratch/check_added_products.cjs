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
  
  const p1 = await Product.findById(id1);
  const p2 = await Product.findById(id2);
  
  console.log("Product 1 details:");
  console.log(JSON.stringify(p1, null, 2));
  
  console.log("Product 2 details:");
  console.log(JSON.stringify(p2, null, 2));
  
  process.exit(0);
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
