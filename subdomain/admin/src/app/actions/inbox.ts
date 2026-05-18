'use server';

import dbConnect from '@/lib/mongodb';
import Subscription from '@/lib/models/Subscription';
import Message from '@/lib/models/Message';
import { revalidatePath } from 'next/cache';

// Newsletter Subscriptions
export async function getSubscriptions() {
  await dbConnect();
  const subs = await Subscription.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(subs));
}

export async function deleteSubscription(id: string) {
  await dbConnect();
  await Subscription.findByIdAndDelete(id);
  revalidatePath('/inbox');
  return { success: true };
}

// Contact Messages
export async function getMessages() {
  await dbConnect();
  const msgs = await Message.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(msgs));
}

export async function deleteMessage(id: string) {
  await dbConnect();
  await Message.findByIdAndDelete(id);
  revalidatePath('/inbox');
  return { success: true };
}
