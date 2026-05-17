'use server';
import dbConnect from '@/lib/mongodb';
import { PinterestIntegration } from '@/models/PinterestIntegration';
import { ScheduledPin } from '@/models/ScheduledPin';
import Product from '@/models/Product';
import { revalidatePath } from 'next/cache';

/**
 * Fetches the Pinterest integration details
 */
export async function getPinterestIntegration() {
  await dbConnect();
  const integration = await PinterestIntegration.findOne({ isActive: true });
  return integration ? JSON.parse(JSON.stringify(integration)) : null;
}

/**
 * Fetches cached boards from the integration
 */
export async function getPinterestBoards() {
  const integration = await getPinterestIntegration();
  return integration?.savedBoards || [];
}

/**
 * Creates a new pin in 'draft' status by default
 */
export async function createPin(data: {
  productId: string;
  boardId: string;
  imageUrl: string;
  altText?: string;
  destinationUrl: string;
  title: string;
  description?: string;
  price?: number;
  scheduledFor: Date;
  status?: 'draft' | 'approved' | 'scheduled';
}) {
  await dbConnect();

  const pin = await ScheduledPin.create({
    ...data,
    status: data.status || 'draft'
  });

  revalidatePath('/pinterest');
  return JSON.parse(JSON.stringify(pin));
}

/**
 * Updates an existing pin's status or data
 */
export async function updatePin(id: string, updates: any) {
  await dbConnect();
  const pin = await ScheduledPin.findByIdAndUpdate(id, updates, { new: true });
  revalidatePath('/pinterest');
  return JSON.parse(JSON.stringify(pin));
}

/**
 * Deletes a pin
 */
export async function deletePin(id: string) {
  await dbConnect();
  await ScheduledPin.findByIdAndDelete(id);
  revalidatePath('/pinterest');
  return { success: true };
}

/**
 * Fetches pins by status
 */
export async function getPins(query: any = {}) {
  await dbConnect();
  const pins = await ScheduledPin.find(query).sort({ createdAt: -1 }).populate('productId');
  return JSON.parse(JSON.stringify(pins));
}

/**
 * Placeholder for immediate publishing logic
 */
export async function publishPinImmediately(id: string) {
  await dbConnect();
  const pin = await ScheduledPin.findById(id);
  if (!pin) throw new Error("Pin not found");

  // In a real implementation, this would call the Pinterest API here
  // const response = await callPinterestAPI(pin);
  
  pin.status = 'published';
  pin.pinterestPinId = `live_pin_${Date.now()}`;
  await pin.save();

  revalidatePath('/pinterest');
  return JSON.parse(JSON.stringify(pin));
}

/**
 * Fetches Pinterest Analytics (Placeholder)
 */
export async function getPinterestAnalytics() {
  return {
    stats: {
      totalImpressions: 124500,
      totalSaves: 850,
      outboundClicks: 3200
    },
    topPins: [
      { id: '1', title: 'Luxury Silk Scarf', thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3', impressions: 45000, clicks: 1200 },
      { id: '2', title: 'Gold Embellished Clutch', thumbnail: 'https://images.unsplash.com/photo-1566150905458-1bf1fd113962', impressions: 32000, clicks: 850 },
      { id: '3', title: 'Velvet Evening Gown', thumbnail: 'https://images.unsplash.com/photo-1539109132374-34fa52636c7b', impressions: 28000, clicks: 640 },
      { id: '4', title: 'Diamond Drop Earrings', thumbnail: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908', impressions: 15000, clicks: 420 },
      { id: '5', title: 'Handcrafted Leather Belt', thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', impressions: 4500, clicks: 90 }
    ]
  };
}

// Legacy support for schedulePin if needed, but we'll use createPin/updatePin going forward
export async function schedulePin(data: any) {
  return createPin({ ...data, status: data.immediate ? 'published' : 'scheduled' });
}
