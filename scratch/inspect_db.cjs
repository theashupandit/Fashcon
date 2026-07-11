const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

async function inspect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count products and blogs
    const productCount = await mongoose.connection.db.collection('products').countDocuments();
    const blogCount = await mongoose.connection.db.collection('blogs').countDocuments();
    const categoriesCount = await mongoose.connection.db.collection('categories').countDocuments();

    console.log('Product count:', productCount);
    console.log('Blog count:', blogCount);
    console.log('Categories count:', categoriesCount);

    // Get sample products
    const sampleProducts = await mongoose.connection.db.collection('products').find({}).limit(5).toArray();
    console.log('\n--- Sample Products ---');
    sampleProducts.forEach(p => {
      console.log(`- Title: ${p.title}, Category: ${p.category}, Tags: ${JSON.stringify(p.tags)}, Badge: ${p.badge}, subCategory: ${JSON.stringify(p.subCategory)}`);
    });

    // Get sample blogs
    const sampleBlogs = await mongoose.connection.db.collection('blogs').find({}).limit(5).toArray();
    console.log('\n--- Sample Blogs ---');
    sampleBlogs.forEach(b => {
      console.log(`- Title: ${b.title}, Category: ${b.category}, Status: ${b.status}`);
    });

    // Get sample categories
    const sampleCategories = await mongoose.connection.db.collection('categories').find({}).toArray();
    console.log('\n--- Categories ---');
    sampleCategories.forEach(c => {
      console.log(`- Name: ${c.name}, Type: ${c.type}, parentCategory: ${c.parentCategory}`);
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error during inspection:', err);
  }
}

inspect();
