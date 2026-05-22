const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://fashcon21:eMfr2aW5C36U6k68@fashcon.13rzcve.mongodb.net/?appName=Fashcon";

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    console.log(`Total Products: ${products.length}`);
    
    products.forEach((prod) => {
      console.log(`\nProduct: ${prod.title}`);
      console.log(`- category: ${JSON.stringify(prod.category)}`);
      console.log(`- subCategory: ${JSON.stringify(prod.subCategory)}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
