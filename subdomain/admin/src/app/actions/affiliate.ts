'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import AffiliateLink from '@/lib/models/AffiliateLink';

export async function getAffiliateLinks() {
  await dbConnect();
  try {
    const links = await AffiliateLink.find({}).sort({ clicks: -1 }).lean();
    return JSON.parse(JSON.stringify(links));
  } catch (error) {
    console.error('Error fetching affiliate links:', error);
    return [];
  }
}

export async function createAffiliateLink(data: any) {
  await dbConnect();
  try {
    const link = await AffiliateLink.create(data);
    revalidatePath('/affiliate');
    return { success: true, id: link._id.toString() };
  } catch (error) {
    console.error('Error creating affiliate link:', error);
    return { success: false, error: 'Failed to create link' };
  }
}

export async function deleteAffiliateLink(id: string) {
  await dbConnect();
  try {
    await AffiliateLink.findByIdAndDelete(id);
    revalidatePath('/affiliate');
    return { success: true };
  } catch (error) {
    console.error('Error deleting affiliate link:', error);
    return { success: false, error: 'Failed to delete link' };
  }
}

export async function updateAffiliateLink(id: string, data: any) {
  await dbConnect();
  try {
    await AffiliateLink.findByIdAndUpdate(id, data);
    revalidatePath('/affiliate');
    return { success: true };
  } catch (error) {
    console.error('Error updating affiliate link:', error);
    return { success: false, error: 'Failed to update link' };
  }
}
