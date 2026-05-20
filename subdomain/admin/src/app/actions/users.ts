'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { revalidatePath } from 'next/cache';
import { requireSuperAdmin, logAdminAction } from '@/lib/server-auth';

export async function getUsers() {
  await requireSuperAdmin();
  await dbConnect();
  const users = await User.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(users));
}

export async function updateUserRole(id: string, role: string) {
  await requireSuperAdmin();
  await dbConnect();
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  await logAdminAction('Update User Role', `Updated user ID: ${id} to role ${role}`);
  revalidatePath('/users');
  return JSON.parse(JSON.stringify(user));
}

export async function deleteUser(id: string) {
  await requireSuperAdmin();
  await dbConnect();
  await User.findByIdAndDelete(id);
  await logAdminAction('Hard Delete User', `Deleted user ID: ${id}`);
  revalidatePath('/users');
}

export async function createOperator(data: any) {
  await requireSuperAdmin();
  await dbConnect();
  const user = await User.create(data);
  await logAdminAction('Create Operator', `Created operator ID: ${user._id}`);
  revalidatePath('/users');
  return JSON.parse(JSON.stringify(user));
}

export async function updateOperator(id: string, data: any) {
  await requireSuperAdmin();
  await dbConnect();
  
  const user = await User.findByIdAndUpdate(id, { $set: data }, { new: true });
  await logAdminAction('Update Operator', `Updated operator ID: ${id}`);
  revalidatePath('/users');
  return JSON.parse(JSON.stringify(user));
}
