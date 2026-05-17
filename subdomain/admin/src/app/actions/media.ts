'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import Media, { IMedia } from '@/lib/models/Media';

export async function getMedia() {
  try {
    await dbConnect();
    const media = await Media.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(media));
  } catch (error) {
    console.error('Error fetching media:', error);
    return [];
  }
}

export async function createMedia(data: Partial<IMedia>) {
  try {
    await dbConnect();
    const newMedia = await Media.create({
      ...data,
      createdAt: new Date(),
    });
    revalidatePath('/media');
    return { success: true, data: JSON.parse(JSON.stringify(newMedia)) };
  } catch (error) {
    console.error('Error creating media:', error);
    return { success: false, error: 'Failed to create media' };
  }
}

export async function deleteMedia(id: string) {
  try {
    await dbConnect();
    await Media.findByIdAndDelete(id);
    revalidatePath('/media');
    return { success: true };
  } catch (error) {
    console.error('Error deleting media:', error);
    return { success: false, error: 'Failed to delete media' };
  }
}

export async function syncMedia(images: { name: string, url: string }[]) {
  try {
    await dbConnect();
    const results = await Promise.all(images.map(img => 
      Media.findOneAndUpdate(
        { url: img.url },
        { 
          name: img.name, 
          url: img.url,
          size: Math.floor(Math.random() * 500000),
          type: 'image/jpeg',
          path: 'external'
        },
        { upsert: true, new: true }
      )
    ));
    revalidatePath('/media');
    return { success: true, count: results.length };
  } catch (error) {
    console.error('Error syncing media:', error);
    return { success: false, error: 'Failed to sync media' };
  }
}
