'use server';

import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import CategoryModel from '@/lib/models/Category';
import { revalidatePath } from 'next/cache';
import { requireAdmin, logAdminAction } from '@/lib/server-auth';

export async function getCategories(type?: 'product' | 'blog') {
  await dbConnect();
  const Model = CategoryModel || (mongoose.models && mongoose.models.Category) || mongoose.model('Category');
  if (!Model) {
    throw new Error('Category model not found');
  }
  const filter: any = { isDeleted: { $ne: true } };
  if (type) filter.type = type;
  const categories = await Model.find(filter).sort({ name: 1 });
  return JSON.parse(JSON.stringify(categories));
}

export async function createCategory(data: any) {
  await requireAdmin();
  await dbConnect();
  
  delete data.createdAt;
  if (data.slug && data.slug.length > 200) throw new Error('Slug too long');

  const Model = CategoryModel || (mongoose.models && mongoose.models.Category) || mongoose.model('Category');
  const category = await Model.create(data);
  await logAdminAction('Create Category', `Created category ID: ${category._id}`);
  
  revalidatePath('/categories');
  return JSON.parse(JSON.stringify(category));
}

export async function updateCategory(id: string, data: any) {
  await requireAdmin();
  await dbConnect();
  
  delete data.createdAt;
  if (data.slug && data.slug.length > 200) throw new Error('Slug too long');

  const Model = CategoryModel || (mongoose.models && mongoose.models.Category) || mongoose.model('Category');
  const updatedCategory = await Model.findByIdAndUpdate(id, data, { new: true });
  await logAdminAction('Update Category', `Updated category ID: ${id}`);
  
  revalidatePath('/categories');
  return JSON.parse(JSON.stringify(updatedCategory));
}

export async function deleteCategory(id: string) {
  const session = await requireAdmin();
  await dbConnect();
  const Model = CategoryModel || (mongoose.models && mongoose.models.Category) || mongoose.model('Category');
  
  if (session.role === 'super_admin') {
    await Model.findByIdAndDelete(id);
    await logAdminAction('Hard Delete Category', `Hard deleted category ID: ${id}`);
  } else {
    await Model.findByIdAndUpdate(id, { isDeleted: true });
    await logAdminAction('Soft Delete Category', `Soft deleted category ID: ${id}`);
  }
  revalidatePath('/categories');
}
