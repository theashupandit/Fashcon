'use server';

import dbConnect from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import { revalidatePath } from 'next/cache';

export async function getBlogs() {
  await dbConnect();
  const blogs = await Blog.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(blogs));
}

export async function getBlogById(id: string) {
  await dbConnect();
  const blog = await Blog.findById(id);
  return JSON.parse(JSON.stringify(blog));
}

export async function createBlog(data: any) {
  await dbConnect();
  const blog = await Blog.create(data);
  revalidatePath('/blogs');
  revalidatePath(`/blog/${blog.slug}`);
  revalidatePath('/', 'layout');
  return JSON.parse(JSON.stringify(blog));
}

export async function updateBlog(id: string, data: any) {
  await dbConnect();
  const blog = await Blog.findByIdAndUpdate(id, data, { new: true });
  revalidatePath('/blogs');
  revalidatePath(`/blog/${blog?.slug}`);
  revalidatePath('/', 'layout');
  return JSON.parse(JSON.stringify(blog));
}

export async function deleteBlog(id: string) {
  await dbConnect();
  await Blog.findByIdAndDelete(id);
  revalidatePath('/blogs');
}
