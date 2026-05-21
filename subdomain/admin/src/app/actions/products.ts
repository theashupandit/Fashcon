'use server';

import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { revalidatePath } from 'next/cache';
import { requireAdmin, logAdminAction } from '@/lib/server-auth';

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
  
  const query: any = { isDeleted: { $ne: true } };
  
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
  await requireAdmin();
  await dbConnect();
  
  await Product.findByIdAndUpdate(id, { isDeleted: true });
  await logAdminAction('Soft Delete Product', `Moved product ID: ${id} to Trash`);
  
  revalidatePath('/products');
}

export async function updateProductStatus(id: string, status: string) {
  const session = await requireAdmin();
  await dbConnect();

  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  if ((product.status as string) === 'archived' && session.role !== 'super_admin') {
     throw new Error('Terminal Status Lock: Only super_admin can modify archived products');
  }

  await Product.findByIdAndUpdate(id, { status });
  await logAdminAction('Update Product Status', `Product ID: ${id} status changed to ${status}`);
  revalidatePath('/products');
}

export async function createProduct(data: any) {
  await requireAdmin();
  await dbConnect();

  delete data.createdAt;
  if (data.slug && data.slug.length > 200) throw new Error('Slug too long');

  const product = await Product.create(data);
  await logAdminAction('Create Product', `Created product ID: ${product._id}`);
  revalidatePath('/products');
  return JSON.parse(JSON.stringify(product));
}

export async function updateProduct(id: string, data: any) {
  const session = await requireAdmin();
  await dbConnect();
  
  delete data.createdAt;
  delete data.reviewsCount; // Prevent action bypass
  if (data.affiliate) delete data.affiliate.clicks; // Prevent action bypass

  if (data.slug && data.slug.length > 200) throw new Error('Slug too long');

  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  
  if ((product.status as string) === 'archived' && session.role !== 'super_admin') {
     throw new Error('Terminal Status Lock: Only super_admin can modify archived products');
  }

  Object.assign(product, data);
  await product.save();
  await logAdminAction('Update Product', `Updated product ID: ${id}`);
  
  revalidatePath('/products');
  return JSON.parse(JSON.stringify(product));
}

export async function getProductById(id: string) {
  await dbConnect();
  const product = await Product.findOne({ _id: id, isDeleted: { $ne: true } });
  return product ? JSON.parse(JSON.stringify(product)) : null;
}

export async function bulkDeleteProducts(ids: string[]) {
  await requireAdmin();
  await dbConnect();
  
  await Product.updateMany({ _id: { $in: ids } }, { isDeleted: true });
  await logAdminAction('Bulk Soft Delete Products', `Moved IDs to Trash: ${ids.join(', ')}`);
  
  revalidatePath('/products');
}

export async function bulkUpdateProductStatus(ids: string[], status: string) {
  const session = await requireAdmin();
  await dbConnect();
  
  await Product.updateMany({ _id: { $in: ids } }, { status });
  await logAdminAction('Bulk Update Status', `Changed status to ${status} for IDs: ${ids.join(', ')}`);
  revalidatePath('/products');
}

export async function bulkUpdateProducts(ids: string[], data: any) {
  await requireAdmin();
  await dbConnect();
  
  delete data.createdAt;
  delete data.reviewsCount;
  if (data.affiliate) delete data.affiliate.clicks;

  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  
  if (Object.keys(updateData).length === 0) return;
  
  await Product.updateMany({ _id: { $in: ids } }, { $set: updateData });
  await logAdminAction('Bulk Update Products', `Updated IDs: ${ids.join(', ')}`);
  revalidatePath('/products');
}

export async function duplicateProduct(id: string) {
  await requireAdmin();
  await dbConnect();
  
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  
  const { _id, createdAt, updatedAt, ...productData } = product.toObject();
  
  productData.title = `${productData.title} (Copy)`;
  productData.slug = `${productData.slug}-copy-${Date.now()}`;
  productData.status = 'draft';
  productData.isDeleted = false;
  if (productData.affiliate) productData.affiliate.clicks = 0;
  
  const newProduct = await Product.create(productData);
  await logAdminAction('Duplicate Product', `Duplicated product ${id} to ${newProduct._id}`);
  revalidatePath('/products');
  return JSON.parse(JSON.stringify(newProduct));
}

export async function getProductStats() {
  await dbConnect();
  const Model = Product || (mongoose.models && mongoose.models.Product) || mongoose.model('Product');
  
  const total = await Model.countDocuments({ isDeleted: { $ne: true } });
  const published = await Model.countDocuments({ status: 'published', isDeleted: { $ne: true } });
  const drafts = await Model.countDocuments({ status: 'draft', isDeleted: { $ne: true } });
  const trash = await Model.countDocuments({ isDeleted: true });
  
  const result = await Model.aggregate([
    { $match: { isDeleted: { $ne: true } } },
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
    trash,
    clicks: result[0]?.totalClicks || 0,
    revenue: 0
  };
}

export async function getTrashProducts(params: {
  page?: number;
  limit?: number;
} = {}) {
  await requireAdmin();
  const { page = 1, limit = 10 } = params;
  await dbConnect();
  
  const query = { isDeleted: true };
  const skip = (page - 1) * limit;
  
  const products = await Product.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Product.countDocuments(query);
  
  return {
    products: JSON.parse(JSON.stringify(products)),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function restoreProduct(id: string) {
  await requireAdmin();
  await dbConnect();
  
  await Product.findByIdAndUpdate(id, { isDeleted: false });
  await logAdminAction('Restore Product', `Restored product ID: ${id}`);
  revalidatePath('/products');
}

export async function hardDeleteProduct(id: string) {
  const session = await requireAdmin();
  if (session.role !== 'super_admin') {
    throw new Error('Unauthorized: Only Super Admin can hard delete products.');
  }
  await dbConnect();
  
  await Product.findByIdAndDelete(id);
  await logAdminAction('Hard Delete Product (Trash)', `Permanently deleted product ID: ${id}`);
  revalidatePath('/products');
}
