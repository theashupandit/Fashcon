'use server';

import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Blog from '@/lib/models/Blog';
import { buildSearchSuggestions, toPublicCategories } from '@/lib/public-content';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getFeaturedProducts() {
  await dbConnect();
  return JSON.parse(JSON.stringify(await Product.find({ isFeatured: true, status: 'published' }).sort({ createdAt: -1 })));
}

export async function getAllProducts() {
  await dbConnect();
  return JSON.parse(JSON.stringify(await Product.find({ status: 'published' }).sort({ createdAt: -1 })));
}

export async function getProductsByCategory(categorySlug: string) {
  await dbConnect();
  const safeCategory = new RegExp(`^${escapeRegExp(categorySlug)}$`, 'i');
  return JSON.parse(JSON.stringify(await Product.find({
    category: safeCategory,
    status: 'published',
  }).sort({ createdAt: -1 })));
}

export async function getProductBySlug(slug: string) {
  await dbConnect();
  return JSON.parse(JSON.stringify(await Product.findOne({ slug, status: 'published' })));
}

export async function getCategories(type: 'product' | 'blog' = 'product') {
  await dbConnect();
  const cats = await Category.find({ type }).sort({ name: 1 });
  console.log(`[storefront] fetched ${cats.length} categories of type ${type} from DB`);
  return JSON.parse(JSON.stringify(cats));
}

export async function getPublicCategories(type: 'product' | 'blog' = 'product') {
  const categories = await getCategories(type);
  return toPublicCategories(categories);
}

export async function getLatestBlogs() {
  await dbConnect();
  return JSON.parse(JSON.stringify(await Blog.find({ status: 'published' }).sort({ createdAt: -1 }).limit(3)));
}

export async function getBlogBySlug(slugOrId: string) {
  await dbConnect();
  
  // Try finding by slug first
  let post = await Blog.findOne({ status: 'published', slug: slugOrId });
  
  // If not found and it looks like a Mongo ID, try finding by ID
  if (!post && /^[0-9a-fA-F]{24}$/.test(slugOrId)) {
    post = await Blog.findOne({ status: 'published', _id: slugOrId });
  }

  return post ? JSON.parse(JSON.stringify(post)) : null; 
}

export async function recordClick(productId: string, variantIndex?: number) {
  await dbConnect();
  const update: any = { $inc: { 'affiliate.clicks': 1 } };
  
  if (variantIndex !== undefined && variantIndex !== null) {
    // Increment variant-specific clicks
    update.$inc[`variants.${variantIndex}.clicks`] = 1;
  }

  await Product.findByIdAndUpdate(productId, update);
}

export async function searchProducts(query: string) {
  await dbConnect();
  const searchRegex = new RegExp(query, 'i');
  return JSON.parse(JSON.stringify(await Product.find({
    status: 'published',
    $or: [
      { title: searchRegex },
      { category: searchRegex },
      { description: searchRegex },
      { tags: searchRegex }
    ]
  }).sort({ createdAt: -1 })));
}


export async function getRelatedProducts(category: string, currentSlug: string) {
  await dbConnect();
  const safeCategory = new RegExp(`^${escapeRegExp(category)}$`, 'i');
  return JSON.parse(JSON.stringify(await Product.find({ 
    category: safeCategory, 
    slug: { $ne: currentSlug },
    status: 'published' 
  }).limit(4)));
}

export async function getNavbarSuggestions() {
  await dbConnect();
  const [products, blogs, categories] = await Promise.all([
    Product.find({ status: 'published' }).sort({ createdAt: -1 }).limit(12).select('title').lean(),
    Blog.find({ status: 'published' }).sort({ createdAt: -1 }).limit(8).select('title').lean(),
    Category.find({ type: 'product' }).sort({ name: 1 }).limit(8).select('name').lean(),
  ]);

  return buildSearchSuggestions({
    products,
    blogs,
    categories,
    extras: [
      'Summer Trends 2026',
      'Minimalist Jewelry',
      'Boho Chic Outfits',
      'Skincare Routine',
      'Wedding Guest Dresses',
    ],
  });
}
