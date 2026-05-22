const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://fashcon21:eMfr2aW5C36U6k68@fashcon.13rzcve.mongodb.net/?appName=Fashcon";

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
    console.log(`Total Categories: ${categories.length}`);
    
    categories.forEach((cat) => {
      console.log(`\nCategory:`);
      console.log(`- _id: ${cat._id}`);
      console.log(`- name: ${JSON.stringify(cat.name)}`);
      console.log(`- slug: ${JSON.stringify(cat.slug)}`);
      console.log(`- parentCategory: ${JSON.stringify(cat.parentCategory)}`);
      console.log(`- type: ${JSON.stringify(cat.type)}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
