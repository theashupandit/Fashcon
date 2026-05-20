'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function getUserProfile(email: string) {
  await dbConnect();
  const user = await User.findOne({ email });
  if (user) {
    return JSON.parse(JSON.stringify(user));
  }
  return null;
}

export async function loginUser(email: string, password?: string) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
  const superAdminPass = process.env.SUPER_ADMIN_PASSWORD || process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD;

  if (superAdminEmail && email === superAdminEmail && password === superAdminPass) {
    return {
      _id: 'local-super-admin',
      uid: 'local-super-admin',
      email: superAdminEmail,
      role: 'super_admin',
      displayName: 'System Super Admin',
    };
  }

  if (adminEmail && email === adminEmail && password === adminPass) {
    return {
      _id: 'local-admin',
      uid: 'local-admin',
      email: adminEmail,
      role: 'admin',
      displayName: 'System Admin',
    };
  }

  await dbConnect();
  const user = await User.findOne({ email });
  if (user) {
    if (user.password && user.password !== password) {
      return { error: 'Invalid credentials' };
    }
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    return JSON.parse(JSON.stringify(user));
  }
  return null;
}
export async function updateUserProfile(email: string, data: any) {
  await dbConnect();
  const user = await User.findOneAndUpdate(
    { email },
    { $set: data },
    { new: true, runValidators: true, upsert: true }
  );
  if (user) {
    return JSON.parse(JSON.stringify(user));
  }
  return null;
}
