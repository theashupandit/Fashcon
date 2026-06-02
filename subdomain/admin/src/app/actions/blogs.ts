'use server';

import dbConnect from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import { revalidatePath } from 'next/cache';
import { requireAdmin, logAdminAction } from '@/lib/server-auth';

export async function getBlogs() {
  await dbConnect();
  const blogs = await Blog.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(blogs));
}

export async function getBlogById(id: string) {
  await dbConnect();
  const blog = await Blog.findOne({ _id: id, isDeleted: { $ne: true } });
  return JSON.parse(JSON.stringify(blog));
}

export async function createBlog(data: any) {
  const session = await requireAdmin();
  await dbConnect();
  
  const safeData = { ...data, author: data.author || session.email };
  delete safeData.createdAt;

  if (safeData.slug && safeData.slug.length > 200) throw new Error('Slug too long');
  if (safeData.tags && Array.isArray(safeData.tags) && safeData.tags.length > 100) throw new Error('Too many tags');

  const blog = await Blog.create(safeData);
  await logAdminAction('Create Blog', `Created blog ID: ${blog._id}`);
  
  revalidatePath('/blogs');
  revalidatePath(`/blog/${blog.slug}`);
  revalidatePath('/', 'layout');
  return JSON.parse(JSON.stringify(blog));
}

export async function updateBlog(id: string, data: any) {
  const session = await requireAdmin();
  await dbConnect();
  
  delete data.createdAt;
  delete data.views;

  if (data.slug && data.slug.length > 200) throw new Error('Slug too long');
  if (data.tags && Array.isArray(data.tags) && data.tags.length > 100) throw new Error('Too many tags');

  const blog = await Blog.findById(id);
  if (!blog) throw new Error('Blog not found');

  if ((blog.status as string) === 'archived' && session.role !== 'super_admin') {
     throw new Error('Terminal Status Lock: Only super_admin can modify archived blogs');
  }

  const updatedBlog = await Blog.findByIdAndUpdate(id, data, { new: true });
  await logAdminAction('Update Blog', `Updated blog ID: ${id}`);
  
  revalidatePath('/blogs');
  revalidatePath(`/blog/${updatedBlog?.slug}`);
  revalidatePath('/', 'layout');
  return JSON.parse(JSON.stringify(updatedBlog));
}

export async function deleteBlog(id: string) {
  const session = await requireAdmin();
  await dbConnect();

  if (session.role === 'super_admin') {
    await Blog.findByIdAndDelete(id);
    await logAdminAction('Hard Delete Blog', `Hard deleted blog ID: ${id}`);
  } else {
    await Blog.findByIdAndUpdate(id, { isDeleted: true });
    await logAdminAction('Soft Delete Blog', `Soft deleted blog ID: ${id}`);
  }

  revalidatePath('/blogs');
}
