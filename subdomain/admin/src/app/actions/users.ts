'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { revalidatePath } from 'next/cache';
import { requireSuperAdmin, requireAdmin, logAdminAction } from '@/lib/server-auth';

export async function getUsers() {
  await requireAdmin();
  await dbConnect();
  const users = await User.find({}).sort({ createdAt: -1 });
  
  const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const modifiedUsers = users.map(user => {
    const obj = user.toObject();
    if (superAdminEmail && obj.email === superAdminEmail) obj.role = 'super_admin';
    else if (adminEmail && obj.email === adminEmail && obj.role !== 'super_admin') obj.role = 'admin';
    return obj;
  });

  return JSON.parse(JSON.stringify(modifiedUsers));
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
  
  const user = await User.findById(id);
  if (user && user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
    throw new Error('Cannot delete the root super administrator.');
  }

  await User.findByIdAndDelete(id);
  await logAdminAction('Hard Delete User', `Deleted user ID: ${id}`);
  revalidatePath('/users');
}

export async function createOperator(data: any) {
  await requireAdmin();
  await dbConnect();
  const user = await User.create(data);
  await logAdminAction('Create Operator', `Created operator ID: ${user._id}`);
  revalidatePath('/users');
  return JSON.parse(JSON.stringify(user));
}

export async function updateOperator(id: string, data: any) {
  await requireAdmin();
  await dbConnect();
  
  const existingUser = await User.findById(id);
  if (existingUser && existingUser.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
    throw new Error('Cannot modify the root super administrator configuration.');
  }

  const user = await User.findByIdAndUpdate(id, { $set: data }, { new: true });
  await logAdminAction('Update Operator', `Updated operator ID: ${id}`);
  revalidatePath('/users');
  return JSON.parse(JSON.stringify(user));
}
