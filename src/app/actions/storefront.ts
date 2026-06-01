'use server';

import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Blog from '@/lib/models/Blog';
import Subscription from '@/lib/models/Subscription';
import Message from '@/lib/models/Message';
import { buildSearchSuggestions, toPublicCategories } from '@/lib/public-content';

function escapeRegExp(value: string) {
  let escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Handle both straight (') and curly (’) apostrophes
  escaped = escaped.replace(/['’]/g, "['’]");
  return escaped;
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
    const regexPattern = '^' + words.map(w => escapeRegExp(w)).join('[-\\s]+') + '[-\\s]*$';
    safeCategory = new RegExp(regexPattern, 'i');
  } else {
    safeCategory = new RegExp(`^${escapeRegExp(categorySlug)}[-\\s]*$`, 'i');
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

export async function getCategories(type: 'product' | 'blog' = 'product', includeSubcategories = false) {
  await dbConnect();
  
  const query: any = { 
    type, 
    isDeleted: { $ne: true }
  };

  if (!includeSubcategories) {
    query.$or = [
      { parentCategory: { $exists: false } },
      { parentCategory: null },
      { parentCategory: "" },
      { parentCategory: "none" },
      { parentCategory: "None" }
    ];
  }
  
  const cats = await Category.find(query).sort({ name: 1 });
  return JSON.parse(JSON.stringify(cats));
}

export async function getPublicCategories(type: 'product' | 'blog' = 'product', includeSubcategories = false) {
  const categories = await getCategories(type, includeSubcategories);
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
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  // Create an array of regexes for each word in the query for better partial matching
  const words = cleanQuery.split(/\s+/).filter(w => w.length > 1);
  const wordRegexes = words.map(w => new RegExp(escapeRegExp(w), 'i'));
  
  // Also keep the full query regex
  const fullQueryRegex = new RegExp(escapeRegExp(cleanQuery), 'i');

  return JSON.parse(JSON.stringify(await Product.find({
    status: 'published',
    $or: [
      { title: fullQueryRegex },
      { category: fullQueryRegex },
      { subCategory: fullQueryRegex },
      { description: fullQueryRegex },
      { tags: { $in: wordRegexes.length > 0 ? wordRegexes : [fullQueryRegex] } },
      // Support matching any word in the query against multiple fields
      ...(wordRegexes.map(re => ({
        $or: [
          { title: re },
          { category: re },
          { subCategory: re },
          { tags: re }
        ]
      })))
    ]
  }).sort({ createdAt: -1 })));
}


export async function getRelatedProducts(category: string, currentSlug: string, subCategoryArray: any = []) {
  await dbConnect();
  
  const decoded = decodeURIComponent(category);
  const clean = decoded.toLowerCase().trim().replace(/[-\s]+/g, ' ');
  const words = clean.split(' ').filter(Boolean);
  
  let safeCategory;
  if (words.length > 0) {
    const regexPattern = '^' + words.map(w => escapeRegExp(w)).join('[-\\s]+') + '[-\\s]*$';
    safeCategory = new RegExp(regexPattern, 'i');
  } else {
    safeCategory = new RegExp(`^${escapeRegExp(category)}[-\\s]*$`, 'i');
  }

  // Find products in the same category
  const baseQuery: any = { 
    category: safeCategory, 
    slug: { $ne: currentSlug },
    status: 'published' 
  };

  // Normalize subcategories into an array of strings
  const normalizedSubCategories: string[] = Array.isArray(subCategoryArray)
    ? subCategoryArray
    : typeof subCategoryArray === 'string' && subCategoryArray.trim()
      ? [subCategoryArray.trim()]
      : [];

  // If the product has subcategories, try to find matches that share at least one subcategory
  if (normalizedSubCategories.length > 0) {
    const subCatRegexes = normalizedSubCategories.map(sub => new RegExp(`^${escapeRegExp(sub)}$`, 'i'));
    
    // First try: Match both Category AND at least one Subcategory
    const strictMatches = await Product.find({
      ...baseQuery,
      subCategory: { $in: subCatRegexes }
    }).limit(4);

    if (strictMatches.length >= 4) {
      return JSON.parse(JSON.stringify(strictMatches));
    }

    // Second try: Fill the rest with products from the same Category
    const strictIds = strictMatches.map(p => p._id);
    const remainingMatches = await Product.find({
      ...baseQuery,
      _id: { $nin: strictIds }
    }).limit(4 - strictMatches.length);

    return JSON.parse(JSON.stringify([...strictMatches, ...remainingMatches]));
  }

  // Fallback: Just return products in the same category
  return JSON.parse(JSON.stringify(await Product.find(baseQuery).limit(4)));
}

export async function getNavbarSuggestions() {
  await dbConnect();
  const [products, blogs, categories] = await Promise.all([
    Product.find({ status: 'published' }).sort({ createdAt: -1 }).limit(20).select('title tags category subCategory').lean(),
    Blog.find({ status: 'published' }).sort({ createdAt: -1 }).limit(10).select('title tags category').lean(),
    Category.find({ 
      isDeleted: { $ne: true }
    }).sort({ name: 1 }).select('name parentCategory').lean(),
  ]);

  return buildSearchSuggestions({
    products: products as any,
    blogs: blogs as any,
    categories: categories as any,
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

export async function getProductById(id: string) {
  await dbConnect();
  try {
    const product = await Product.findById(id);
    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch (e) {
    return null;
  }
}
