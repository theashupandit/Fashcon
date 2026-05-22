const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://fashcon21:eMfr2aW5C36U6k68@fashcon.13rzcve.mongodb.net/?appName=Fashcon";

// Schema matching what's in Next.js
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ['product', 'blog'], required: true },
  count: { type: Number, default: 0 },
  description: { type: String },
  parentCategory: { type: String },
}, { timestamps: true });

async function run() {
  await mongoose.connect(MONGODB_URI);
  const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  const categories = await Category.find({ type: 'product' }).sort({ name: 1 });
  console.log("Action output mock:");
  console.log(categories.map(c => ({
    name: c.name,
    parentCategory: c.parentCategory
  })));
  process.exit(0);
}
run();
