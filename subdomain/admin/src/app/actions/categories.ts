'use server';

import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import CategoryModel from '@/lib/models/Category';
import { revalidatePath } from 'next/cache';

export async function getCategories(type?: 'product' | 'blog') {
  await dbConnect();
  // Fallback to mongoose.models if the imported model is undefined for some reason
  const Model = CategoryModel || (mongoose.models && mongoose.models.Category) || mongoose.model('Category');
  if (!Model) {
    throw new Error('Category model not found');
  }
  const filter = type ? { type } : {};
  const categories = await Model.find(filter).sort({ name: 1 });
  return JSON.parse(JSON.stringify(categories));
}

export async function createCategory(data: any) {
  await dbConnect();
  const Model = CategoryModel || (mongoose.models && mongoose.models.Category) || mongoose.model('Category');
  const category = await Model.create(data);
  revalidatePath('/categories');
  return JSON.parse(JSON.stringify(category));
}

export async function updateCategory(id: string, data: any) {
  await dbConnect();
  const Model = CategoryModel || (mongoose.models && mongoose.models.Category) || mongoose.model('Category');
  const updatedCategory = await Model.findByIdAndUpdate(id, data, { new: true });
  revalidatePath('/categories');
  return JSON.parse(JSON.stringify(updatedCategory));
}

export async function deleteCategory(id: string) {
  await dbConnect();
  const Model = CategoryModel || (mongoose.models && mongoose.models.Category) || mongoose.model('Category');
  await Model.findByIdAndDelete(id);
  revalidatePath('/categories');
}
