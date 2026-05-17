const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://fashcon21:eMfr2aW5C36U6k68@fashcon.13rzcve.mongodb.net/?appName=Fashcon";

async function checkAssets() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const assets = await mongoose.connection.db.collection('mediaassets').find({}).sort({ createdAt: -1 }).toArray();
    console.log(`Total Assets: ${assets.length}`);
    
    assets.slice(0, 5).forEach((asset, i) => {
      console.log(`\nAsset ${i + 1}:`);
      console.log(`- ImageId: ${asset.imageId}`);
      console.log(`- DisplayName: ${asset.displayName}`);
      console.log(`- URL: ${asset.url}`);
      console.log(`- CreatedAt: ${asset.createdAt}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAssets();
