'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  await dbConnect();
  const users = await User.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(users));
}

export async function updateUserRole(id: string, role: string) {
  await dbConnect();
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  revalidatePath('/users');
  return JSON.parse(JSON.stringify(user));
}

export async function deleteUser(id: string) {
  await dbConnect();
  await User.findByIdAndDelete(id);
  revalidatePath('/users');
}
