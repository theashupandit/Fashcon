const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://fashcon21:eMfr2aW5C36U6k68@fashcon.13rzcve.mongodb.net/?appName=Fashcon";

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
  
  const allCategories = await Category.find({ type: 'product' }).sort({ name: 1 });
  const category = allCategories.find((c) => c.slug === 'jewelry');
  const subCategories = allCategories.filter((c) => c.parentCategory === category?.name);
  
  console.log("Found category:", category ? category.name : "None");
  console.log("Found subcategories:", subCategories.map(c => c.name));
  
  process.exit(0);
}
run();
