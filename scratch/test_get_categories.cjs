const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
console.log('Using MONGODB_URI:', MONGODB_URI);

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ['product', 'blog'], required: true },
  count: { type: Number, default: 0 },
  description: { type: String },
  parentCategory: { type: String },
  heroImage: { type: String },
  bannerImage: { type: String },
  heroTitle: { type: String },
  heroSubtitle: { type: String },
  heroAlignment: { 
    type: String, 
    enum: ['left', 'center', 'right'], 
    default: 'left' 
  },
  heroButtonText: { type: String },
  heroButtonLink: { type: String },
  icon: { type: String, default: 'fa-tag' },
  color: { type: String, default: '#6366f1' },
  isDeleted: { type: Boolean, default: false }
}, { 
  timestamps: true 
});

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  brand: { type: String },
  description: { type: String },
  category: { type: String },
  subCategory: [{ type: String }],
  collections: [{ type: String }],
  tags: [{ type: String }],
  badge: { 
    type: String, 
    enum: ["None", "Luxury", "Hot Sale", "New Arrival"],
    default: "None"
  },
  status: { 
    type: String, 
    enum: ["draft", "published"],
    default: "draft"
  },
  prices: {
    original: { type: String },
    offer: { type: String },
    currency: { type: String, default: 'INR' },
    showPricing: { type: Boolean, default: true },
    priceLabel: { type: String },
    discountPercentage: { type: Number }
  },
  affiliate: {
    mainLink: { type: String, required: false },
    platform: { type: String },
    trackingId: { type: String },
    clicks: { type: Number, default: 0 }
  },
  ctaText: { type: String, default: "Buy Now" },
  media: {
    mainImage: { type: String },
    gallery: [{ type: String }],
    blurDataURL: { type: String }
  },
  variants: [
    {
      colorName: String,
      colorCode: String,
      variantImage: String,
      variantGallery: [{ type: String }],
      variantLink: String,
      priceOverride: String,
      inventory: { type: Number, default: 0 },
      isOutOfStock: { type: Boolean, default: false },
      clicks: { type: Number, default: 0 }
    }
  ],
  seo: {
    metaTitle: { type: String, maxlength: 60 },
    metaDesc: { type: String, maxlength: 160 },
    keywords: [{ type: String }],
    canonicalUrl: { type: String }
  },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, min: 0, max: 5, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, { 
  timestamps: true 
});

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  summary: { type: String },
  category: { type: String, required: true },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB via Mongoose');

  const CategoryModel = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);
  const BlogModel = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

  const filter = { isDeleted: { $ne: true } };
  const categories = await CategoryModel.find(filter).sort({ name: 1 });
  console.log(`Found ${categories.length} categories.`);

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      let count = 0;
      try {
        if (cat.type === 'product') {
          count = await ProductModel.countDocuments({
            isDeleted: { $ne: true },
            $or: [
              { category: cat.name },
              { category: cat.slug },
              { subCategory: cat.name },
              { subCategory: cat.slug }
            ]
          });
        } else if (cat.type === 'blog') {
          count = await BlogModel.countDocuments({
            isDeleted: { $ne: true },
            $or: [
              { category: cat.name },
              { category: cat.slug }
            ]
          });
        }
      } catch (err) {
        console.error(`Error counting documents for category: ${cat.name}`, err);
        throw err;
      }

      const catObj = cat.toObject ? cat.toObject() : cat;
      return {
        ...catObj,
        count
      };
    })
  );

  console.log('Categories with counts loaded successfully. First few:');
  console.log(categoriesWithCounts.slice(0, 5).map(c => ({ name: c.name, count: c.count })));

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Run failed with error:', err);
  process.exit(1);
});
