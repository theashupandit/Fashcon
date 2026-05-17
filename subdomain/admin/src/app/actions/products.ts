'use server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { revalidatePath } from 'next/cache';

export async function getProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
} = {}) {
  const { page = 1, limit = 10, search, category, status } = params;
  await dbConnect();
  const Model = Product || (mongoose.models && mongoose.models.Product) || mongoose.model('Product');
  
  const query: any = {};
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category && category !== 'All Categories') {
    query.category = category;
  }
  
  if (status && status !== 'All Status') {
    query.status = status;
  }

  const skip = (page - 1) * limit;
  
  const products = await Model.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Model.countDocuments(query);
  
  return {
    products: JSON.parse(JSON.stringify(products)),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}


export async function deleteProduct(id: string) {
  await dbConnect();
  await Product.findByIdAndDelete(id);
  revalidatePath('/products');
}

export async function updateProductStatus(id: string, status: string) {
  await dbConnect();
  await Product.findByIdAndUpdate(id, { status });
  revalidatePath('/products');
}

export async function createProduct(data: any) {
  await dbConnect();
  const product = await Product.create(data);
  revalidatePath('/products');
  return JSON.parse(JSON.stringify(product));
}

export async function updateProduct(id: string, data: any) {
  await dbConnect();
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  
  Object.assign(product, data);
  await product.save();
  
  revalidatePath('/products');
  return JSON.parse(JSON.stringify(product));
}

export async function getProductById(id: string) {
  await dbConnect();
  const product = await Product.findById(id);
  return product ? JSON.parse(JSON.stringify(product)) : null;
}

export async function bulkDeleteProducts(ids: string[]) {
  await dbConnect();
  await Product.deleteMany({ _id: { $in: ids } });
  revalidatePath('/products');
}

export async function bulkUpdateProductStatus(ids: string[], status: string) {
  await dbConnect();
  await Product.updateMany({ _id: { $in: ids } }, { status });
  revalidatePath('/products');
}

export async function bulkUpdateProducts(ids: string[], data: any) {
  await dbConnect();
  // Filter out undefined/null values from data
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  
  if (Object.keys(updateData).length === 0) return;
  
  await Product.updateMany({ _id: { $in: ids } }, { $set: updateData });
  revalidatePath('/products');
}


export async function duplicateProduct(id: string) {
  await dbConnect();
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  
  const { _id, createdAt, updatedAt, ...productData } = product.toObject();
  
  productData.title = `${productData.title} (Copy)`;
  productData.slug = `${productData.slug}-copy-${Date.now()}`;
  productData.status = 'draft';
  
  const newProduct = await Product.create(productData);
  revalidatePath('/products');
  return JSON.parse(JSON.stringify(newProduct));
}

export async function getProductStats() {
  await dbConnect();
  const Model = Product || (mongoose.models && mongoose.models.Product) || mongoose.model('Product');
  
  const total = await Model.countDocuments();
  const published = await Model.countDocuments({ status: 'published' });
  const drafts = await Model.countDocuments({ status: 'draft' });
  
  const result = await Model.aggregate([
    {
      $group: {
        _id: null,
        totalClicks: { $sum: "$affiliate.clicks" }
      }
    }
  ]);

  return {
    total,
    published,
    drafts,
    clicks: result[0]?.totalClicks || 0,
    revenue: 0 // Placeholder as revenue is not directly tracked in Product model
  };
}
