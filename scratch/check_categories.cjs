const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient("mongodb+srv://fashcon21:eMfr2aW5C36U6k68@fashcon.13rzcve.mongodb.net/?appName=Fashcon");
  try {
    await client.connect();
    const db = client.db('test');
    
    // Find category with ID '6a1b22ffb5e60491d1a1a337'
    const categoryId = '6a1b22ffb5e60491d1a1a337';
    const categories = await db.collection('categories').find({}).toArray();
    console.log(`Total categories in test: ${categories.length}`);
    for (const c of categories) {
      console.log(`- ID: ${c._id.toString()}, Name: ${c.name}, Slug: ${c.slug}, Type: ${c.type}`);
    }
    
    // Look up specifically
    const { ObjectId } = require('mongodb');
    try {
      const match = await db.collection('categories').findOne({ _id: new ObjectId(categoryId) });
      console.log("Found category:", match);
    } catch (e) {
      console.error("Invalid ObjectId format or query error:", e.message);
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
