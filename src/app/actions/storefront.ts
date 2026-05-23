'use server';

import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Blog from '@/lib/models/Blog';
import Subscription from '@/lib/models/Subscription';
import Message from '@/lib/models/Message';
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
  
  const decoded = decodeURIComponent(categorySlug);
  const clean = decoded.toLowerCase().trim().replace(/[-\s]+/g, ' ');
  const words = clean.split(' ').filter(Boolean);
  
  let safeCategory;
  if (words.length > 0) {
    const regexPattern = '^' + words.map(w => escapeRegExp(w)).join('[-\\s]+') + '$';
    safeCategory = new RegExp(regexPattern, 'i');
  } else {
    safeCategory = new RegExp(`^${escapeRegExp(categorySlug)}$`, 'i');
  }

  return JSON.parse(JSON.stringify(await Product.find({
    category: safeCategory,
    status: 'published',
  }).sort({ createdAt: -1 })));
}

export async function getProductBySlug(slug: string) {
  await dbConnect();
  // Try exact match first
  let product = await Product.findOne({ slug, status: 'published' });
  
  if (!product) {
    try {
      const decodedSlug = decodeURIComponent(slug);
      product = await Product.findOne({ slug: decodedSlug, status: 'published' });
    } catch (e) {
      // ignore decode errors
    }
  }

  if (!product) {
    try {
      const decoded = decodeURIComponent(slug);
      const clean = decoded.toLowerCase().trim().replace(/[-\s]+/g, ' ');
      const words = clean.split(' ').filter(Boolean);
      if (words.length > 0) {
        const regexPattern = '^' + words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[-\\s]+') + '$';
        product = await Product.findOne({
          slug: { $regex: new RegExp(regexPattern, 'i') },
          status: 'published'
        });
      }
    } catch (e) {
      // ignore
    }
  }

  return product ? JSON.parse(JSON.stringify(product)) : null;
}

export async function getCategories(type: 'product' | 'blog' = 'product') {
  await dbConnect();
  // Filter out subcategories (those that have a parentCategory)
  const cats = await Category.find({ 
    type, 
    isDeleted: { $ne: true },
    $or: [
      { parentCategory: { $exists: false } },
      { parentCategory: null },
      { parentCategory: "" },
      { parentCategory: "none" },
      { parentCategory: "None" }
    ]
  }).sort({ name: 1 });
  
  console.log(`[storefront] fetched ${cats.length} top-level categories of type ${type} from DB`);
  
  // Debug log to see if any subcategories are leaking through
  cats.forEach(c => {
    if (c.parentCategory && !["", "none", "None"].includes(c.parentCategory)) {
       console.log(`[storefront] CRITICAL: Category "${c.name}" has parentCategory "${c.parentCategory}" but was returned by query!`);
    }
  });

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

export async function getAllBlogs() {
  await dbConnect();
  return JSON.parse(JSON.stringify(await Blog.find({ status: 'published' }).sort({ createdAt: -1 })));
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
  
  const decoded = decodeURIComponent(category);
  const clean = decoded.toLowerCase().trim().replace(/[-\s]+/g, ' ');
  const words = clean.split(' ').filter(Boolean);
  
  let safeCategory;
  if (words.length > 0) {
    const regexPattern = '^' + words.map(w => escapeRegExp(w)).join('[-\\s]+') + '$';
    safeCategory = new RegExp(regexPattern, 'i');
  } else {
    safeCategory = new RegExp(`^${escapeRegExp(category)}$`, 'i');
  }

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
    Category.find({ 
      type: 'product', 
      isDeleted: { $ne: true },
      $or: [
        { parentCategory: { $exists: false } },
        { parentCategory: null },
        { parentCategory: "" },
        { parentCategory: "none" },
        { parentCategory: "None" }
      ]
    }).sort({ name: 1 }).limit(8).select('name').lean(),
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

export async function subscribeToNewsletter(email: string) {
  await dbConnect();
  try {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    const existing = await Subscription.findOne({ email: trimmedEmail });
    if (existing) {
      return { success: true, message: 'Already subscribed! Thank you.' };
    }
    await Subscription.create({ email: trimmedEmail });
    return { success: true, message: 'Thank you for subscribing!' };
  } catch (error: any) {
    console.error('Newsletter subscribe error:', error);
    return { success: false, error: 'Failed to subscribe. Please try again.' };
  }
}

export async function sendContactMessage(data: { name: string; email: string; subject: string; message: string }) {
  await dbConnect();
  try {
    const { name, email, subject, message } = data;
    if (!name || !email || !subject || !message) {
      return { success: false, error: 'All fields are required.' };
    }
    const trimmedEmail = email.toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    await Message.create({
      name: name.trim(),
      email: trimmedEmail,
      subject: subject.trim(),
      message: message.trim(),
    });
    return { success: true, message: 'Message sent successfully! We will get back to you shortly.' };
  } catch (error: any) {
    console.error('Contact form send error:', error);
    return { success: false, error: 'Failed to send message. Please try again.' };
  }
}
