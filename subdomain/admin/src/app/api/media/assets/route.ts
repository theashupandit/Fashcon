import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MediaAsset from '@/lib/models/MediaAsset';
import Product from '@/lib/models/Product';
import Blog from '@/lib/models/Blog';
import Folder from '@/lib/models/Folder';
import { createImageId } from '@/lib/media-id';
import mongoose from 'mongoose';

function createFallbackDisplayName(folderName: string, originalFilename: string) {
  const baseName = originalFilename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'uploaded asset';
  return `${folderName || 'Root'}/${baseName}`;
}

import { cloudinary } from '@/lib/cloudinary-server';

async function syncCloudinaryAssets(folderId: string | null) {
  try {
    let folderPath = '';
    if (folderId && folderId !== 'root') {
      const folder = await Folder.findById(folderId).lean();
      if (folder) folderPath = folder.path;
    }

    const rootPrefix = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'Collection';
    // Ensure fullPath ends with a slash for precise folder matching
    const fullPath = folderPath 
      ? (folderPath.endsWith('/') ? `${rootPrefix}/${folderPath}` : `${rootPrefix}/${folderPath}/`)
      : `${rootPrefix}/`;

    console.log(`[admin:media-sync] Syncing Cloudinary assets for folderId: ${folderId}, path: ${fullPath}`);

    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: fullPath,
      max_results: 500,
      delimiter: '/' 
    });

    const resources = result.resources || [];
    console.log(`[admin:media-sync] Cloudinary returned ${resources.length} resources for ${fullPath}`);
    
    for (const res of resources) {
      const storedName = `${res.public_id}.${res.format}`;
      const originalFilename = res.public_id.split('/').pop() || 'asset';
      
      // Update or Create
      await MediaAsset.findOneAndUpdate(
        { storedName: storedName },
        { 
          $set: {
            originalFilename: originalFilename,
            displayName: folderPath ? `${folderPath}/${originalFilename}` : `Root/${originalFilename}`,
            url: res.secure_url,
            thumbnailUrl: cloudinary.url(res.public_id, { width: 150, height: 150, crop: 'fill', secure: true }),
            mediumUrl: cloudinary.url(res.public_id, { width: 600, crop: 'scale', secure: true }),
            folderId: (folderId === 'root' || !folderId) ? null : folderId,
            folderName: folderPath ? folderPath.split('/').pop() : 'Root',
            folderPath: folderPath || '',
            metadata: {
              size: Math.round(res.bytes / 1024),
              format: res.format,
              dimensions: `${res.width}x${res.height}`
            },
          },
          $setOnInsert: {
            imageId: createImageId(originalFilename),
            uploadedBy: new mongoose.Types.ObjectId('64f1a2b3c4d5e6f7a8b9c0d1'),
            isDeleted: false
          }
        },
        { upsert: true, returnDocument: 'after' }
      );
    }
  } catch (error: any) {
    console.error('[admin:media-sync] Asset sync error:', error.message);
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const folderId = searchParams.get('folderId');
    const search = searchParams.get('search');
    const showTrash = searchParams.get('trash') === 'true';

    // Auto-sync for current view
    if (!search && !showTrash) {
      await syncCloudinaryAssets(folderId);
    }

    const query: any = {
      isDeleted: showTrash ? true : { $ne: true },
    };

    if (folderId && folderId !== 'root') {
      if (mongoose.isValidObjectId(folderId)) {
        query.folderId = new mongoose.Types.ObjectId(folderId);
      }
    } else if (folderId === 'root') {
      query.$or = [{ folderId: null }, { folderId: { $exists: false } }];
    }

    if (search) {
      query.$text = { $search: search };
    }

    const assets = await MediaAsset.find(query).sort({ createdAt: -1 }).lean();
    const normalizedAssets = await Promise.all(
      assets.map(async (asset: any) => {
        if (asset.imageId) return asset;

        const generatedImageId = createImageId(asset.displayName || asset.originalFilename || 'asset');
        await MediaAsset.findByIdAndUpdate(asset._id, { imageId: generatedImageId });
        console.log(`[admin:media-assets] backfilled imageId for ${asset._id} -> ${generatedImageId}`);
        return { ...asset, imageId: generatedImageId };
      })
    );

    console.log(`[admin:media-assets] fetched ${normalizedAssets.length} asset(s) from Mongo`);

    return NextResponse.json(normalizedAssets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      originalFilename,
      imageId,
      displayName,
      storedName,
      url,
      thumbnailUrl,
      mediumUrl,
      folderId,
      folderName,
      folderPath,
      uploadedBy,
      metadata,
      altText,
    } = body || {};

    if (!originalFilename || !storedName || !url || !uploadedBy) {
      return NextResponse.json({ error: 'Missing required media asset fields' }, { status: 400 });
    }

    const resolvedFolderId =
      folderId && mongoose.isValidObjectId(folderId)
        ? new mongoose.Types.ObjectId(folderId)
        : null;

    let resolvedFolderName = folderName || 'Root';
    let resolvedFolderPath = folderPath || '';

    if (resolvedFolderId) {
      const folder = await Folder.findById(resolvedFolderId).lean();
      if (folder) {
        resolvedFolderName = folder.name;
        resolvedFolderPath = folder.path || '';
      }
    }

    const resolvedImageId = imageId?.trim() || createImageId(originalFilename);
    const existingImageId = await MediaAsset.findOne({ imageId: resolvedImageId }).lean();
    if (existingImageId) {
      return NextResponse.json({ error: 'Image ID already exists. Please choose a different one.' }, { status: 409 });
    }

    const asset = await MediaAsset.create({
      imageId: resolvedImageId,
      originalFilename,
      displayName: displayName || createFallbackDisplayName(resolvedFolderName, originalFilename),
      storedName,
      url,
      thumbnailUrl: thumbnailUrl || url,
      mediumUrl: mediumUrl || url,
      folderId: resolvedFolderId,
      folderName: resolvedFolderName,
      folderPath: resolvedFolderPath,
      uploadedBy: mongoose.isValidObjectId(uploadedBy)
        ? new mongoose.Types.ObjectId(uploadedBy)
        : new mongoose.Types.ObjectId('64f1a2b3c4d5e6f7a8b9c0d1'),
      metadata: metadata || { size: 0, format: 'image', dimensions: 'unknown' },
      altText: altText || createFallbackDisplayName(resolvedFolderName, originalFilename),
    });

    console.log(`[admin:media-assets] registered fallback asset ${asset.imageId} in Mongo`);

    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, ids, altText, imageId, isDeleted } = body;

    if (!id && (!ids || !Array.isArray(ids))) {
      return NextResponse.json({ error: 'ID or ids array is required' }, { status: 400 });
    }

    const update: any = {};
    if (altText !== undefined) update.altText = altText;
    if (imageId !== undefined && id) {
      const resolvedImageId = String(imageId).trim();
      if (!resolvedImageId) {
        return NextResponse.json({ error: 'Image ID cannot be empty' }, { status: 400 });
      }

      const duplicate = await MediaAsset.findOne({ imageId: resolvedImageId, _id: { $ne: id } }).lean();
      if (duplicate) {
        return NextResponse.json({ error: 'Image ID already exists' }, { status: 409 });
      }

      update.imageId = resolvedImageId;
    }
    if (isDeleted !== undefined) {
      update.isDeleted = isDeleted;
      update.deletedAt = isDeleted ? new Date() : null;
    }

    if (ids && Array.isArray(ids)) {
      const updated = await MediaAsset.updateMany(
        { _id: { $in: ids } },
        { $set: update }
      );
      return NextResponse.json({ success: true, count: updated.modifiedCount });
    }

    const updated = await MediaAsset.findByIdAndUpdate(id, update, { returnDocument: 'after' });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');
    const hardDelete = searchParams.get('hard') === 'true';

    const ids = id ? [id] : idsParam ? idsParam.split(',') : null;

    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: 'ID or ids is required' }, { status: 400 });
    }

    // Check usage for all assets if hard delete
    // For simplicity, we'll check each and collect errors, or just block if any is used.
    // Premium feel: block if any is used and report which ones.

    const usageCheck = await Promise.all(ids.map(async (assetId) => {
      if (!mongoose.isValidObjectId(assetId)) return { id: assetId, error: 'Invalid ID' };
      const asset = await MediaAsset.findById(assetId);
      if (!asset) return { id: assetId, error: 'Not found' };

      const [productCount, blogCount] = await Promise.all([
        Product.countDocuments({
          $or: [
            { 'media.mainImage': asset.url },
            { 'media.mainImage': asset.mediumUrl },
            { 'media.mainImage': asset.thumbnailUrl },
            { 'media.gallery': asset.url },
            { 'media.gallery': asset.mediumUrl },
            { 'media.gallery': asset.thumbnailUrl },
            { 'variants.variantImage': asset.url },
            { 'variants.variantImage': asset.mediumUrl },
            { 'variants.variantImage': asset.thumbnailUrl },
            { 'media.mainImage': assetId },
            { 'media.gallery': assetId },
            { 'variants.variantImage': assetId },
          ],
        }),
        Blog.countDocuments({
          $or: [
            { image: asset.url },
            { image: asset.mediumUrl },
            { image: asset.thumbnailUrl },
            { image: assetId },
          ],
        }),
      ]);

      if (productCount > 0 || blogCount > 0) {
        return {
          id: assetId,
          displayName: asset.displayName || asset.originalFilename,
          productCount,
          blogCount
        };
      }
      return null;
    }));

    const usedAssets = usageCheck.filter(u => u !== null && !u.error);
    if (usedAssets.length > 0) {
      const names = usedAssets.map((u: any) => u.displayName).join(', ');
      return NextResponse.json(
        {
          error: `Cannot delete. Some assets are in use: ${names}`,
          usedAssets,
        },
        { status: 400 }
      );
    }

    if (hardDelete) {
      // 1. Delete from Cloudinary
      const assetsToDelete = await MediaAsset.find({ _id: { $in: ids } }).lean();
      console.log(`[admin:media-delete] Attempting to hard delete ${assetsToDelete.length} asset(s)`);
      
      for (const asset of assetsToDelete) {
        try {
          // Safer public_id extraction
          const lastDotIndex = asset.storedName.lastIndexOf('.');
          const publicId = lastDotIndex !== -1 ? asset.storedName.substring(0, lastDotIndex) : asset.storedName;
          
          if (publicId) {
            console.log(`[admin:media-delete] Destroying Cloudinary asset: ${publicId}`);
            const cloudRes = await cloudinary.uploader.destroy(publicId);
            console.log(`[admin:media-delete] Cloudinary response for ${publicId}:`, cloudRes);
          }
        } catch (err: any) {
          console.error(`[admin:media-delete] Cloudinary destroy failed for ${asset._id}:`, err.message);
        }
      }

      // 2. Delete from MongoDB
      await MediaAsset.deleteMany({ _id: { $in: ids } });
    } else {
      await MediaAsset.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date()
          }
        }
      );
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
