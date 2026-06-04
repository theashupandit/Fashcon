const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const CategorySchema = new mongoose.Schema({}, { strict: false, collection: 'categories' });

async function run() {
  await mongoose.connect(MONGODB_URI);
  const Category = mongoose.model('Category', CategorySchema);
  
  const allCats = await Category.find({});
  console.log(`Total categories in DB: ${allCats.length}`);
  for (const c of allCats) {
    console.log(`- Slug: ${c.get('slug')}, Name: ${c.get('name')}, Type: ${c.get('type')}, isDeleted: ${c.get('isDeleted')}`);
  }
  process.exit(0);
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
