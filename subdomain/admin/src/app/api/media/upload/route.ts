import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MediaAsset from '@/lib/models/MediaAsset';
import Folder from '@/lib/models/Folder';
import { optimizeAndUpload, fetchImageFromUrl } from '@/lib/cloudinary-server';
import { createImageId } from '../../../../lib/media-id';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();

    // Get adminId from formData or use a fallback for dev.
    // The auth mock user can have a non-ObjectId id, so normalize it here.
    const rawAdminId = (formData.get('adminId') as string) || "64f1a2b3c4d5e6f7a8b9c0d1";
    const adminObjectId = mongoose.isValidObjectId(rawAdminId)
      ? new mongoose.Types.ObjectId(rawAdminId)
      : new mongoose.Types.ObjectId("64f1a2b3c4d5e6f7a8b9c0d1");

    const file = formData.get('file') as File | null;
    const url = formData.get('url') as string | null;
    const folderId = formData.get('folderId') as string | null;
    const folderNameOverride = (formData.get('folderName') as string) || '';
    const folderPathOverride = (formData.get('folderPath') as string) || '';

    let buffer: Buffer;
    let filename: string;
    let resolvedFolderName = folderNameOverride || 'Root';
    let resolvedFolderPath = folderPathOverride;
    let resolvedFolderObjectId: mongoose.Types.ObjectId | null = null;

    if (folderId && mongoose.isValidObjectId(folderId)) {
      resolvedFolderObjectId = new mongoose.Types.ObjectId(folderId);
      const folder = await Folder.findById(resolvedFolderObjectId).lean();
      if (folder) {
        resolvedFolderName = folder.name;
        resolvedFolderPath = folder.path || '';
      }
    }

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      filename = file.name;
    } else if (url) {
      buffer = await fetchImageFromUrl(url);
      filename = url.split('/').pop() || 'downloaded_image';
      if (!filename.includes('.')) filename += '.jpg';
    } else {
      return NextResponse.json({ error: 'No file or URL provided' }, { status: 400 });
    }

    const result = await optimizeAndUpload(buffer, filename, adminObjectId.toString(), {
      folderName: resolvedFolderName,
      folderPath: resolvedFolderPath,
    });

    const newAsset = await MediaAsset.create({
      imageId: createImageId(filename),
      originalFilename: filename,
      displayName: result.displayName,
      storedName: result.storedName,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      mediumUrl: result.mediumUrl,
      folderId: resolvedFolderObjectId,
      folderName: resolvedFolderName,
      folderPath: resolvedFolderPath,
      uploadedBy: adminObjectId,
      metadata: result.metadata,
      altText: `${resolvedFolderName} ${filename.split('.')[0]}`.trim(),
    });

    console.log(`[admin:media-upload] uploaded ${newAsset.imageId} to Cloudinary and stored Mongo asset ${newAsset._id}`);

    return NextResponse.json(newAsset);
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
