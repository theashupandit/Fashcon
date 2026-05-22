const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://fashcon21:eMfr2aW5C36U6k68@fashcon.13rzcve.mongodb.net/?appName=Fashcon";

const DummySchema = new mongoose.Schema({}, { strict: false });

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected. Now running find query...");
    const Dummy = mongoose.models.Dummy || mongoose.model('Dummy', DummySchema, 'mediaassets');
    const result = await Dummy.findOne({});
    console.log("Query success! Result:", result);
    process.exit(0);
  } catch (error) {
    console.error("MongoDB Query Error:", error);
    process.exit(1);
  }
}
run();
