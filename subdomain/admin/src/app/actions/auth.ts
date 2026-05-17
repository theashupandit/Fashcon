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

export async function loginUser(email: string) {
  await dbConnect();
  const user = await User.findOne({ email });
  if (user) {
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
