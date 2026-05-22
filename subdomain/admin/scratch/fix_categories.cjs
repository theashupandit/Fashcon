const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://fashcon21:eMfr2aW5C36U6k68@fashcon.13rzcve.mongodb.net/?appName=Fashcon";

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const categoriesCol = db.collection('categories');

    // 1. Update Jewelry to be top-level (parentCategory = "")
    const jewelryRes = await categoriesCol.updateOne(
      { name: "Jewelry" },
      { $set: { parentCategory: "" } }
    );
    console.log(`Updated Jewelry: ${jewelryRes.modifiedCount} document(s)`);

    // 2. Update Necklace to have parentCategory = "Jewelry"
    const necklaceRes = await categoriesCol.updateOne(
      { name: "Necklace" },
      { $set: { parentCategory: "Jewelry" } }
    );
    console.log(`Updated Necklace: ${necklaceRes.modifiedCount} document(s)`);

    // 3. Update Neclace (typo version) to have parentCategory = "Jewelry"
    const neclaceRes = await categoriesCol.updateOne(
      { name: "Neclace" },
      { $set: { parentCategory: "Jewelry" } }
    );
    console.log(`Updated Neclace: ${neclaceRes.modifiedCount} document(s)`);

    // Fetch and print all categories to verify
    const categories = await categoriesCol.find({}).toArray();
    console.log("\nVerifying categories after fix:");
    categories.forEach((cat) => {
      console.log(`- ${cat.name}: parentCategory = ${JSON.stringify(cat.parentCategory)}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
