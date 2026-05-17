import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MediaAsset from '@/lib/models/MediaAsset';
import Folder from '@/lib/models/Folder';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { assetId, assetIds, targetFolderId, action } = await req.json();

    const ids = assetIds && Array.isArray(assetIds) ? assetIds : assetId ? [assetId] : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Asset IDs are required' }, { status: 400 });
    }

    // Resolve target folder
    let resolvedFolderId: mongoose.Types.ObjectId | null = null;
    let folderName = 'Root';
    let folderPath = '';

    if (targetFolderId && mongoose.isValidObjectId(targetFolderId)) {
      const folder = await Folder.findById(targetFolderId).lean();
      if (folder) {
        resolvedFolderId = new mongoose.Types.ObjectId(targetFolderId);
        folderName = folder.name;
        folderPath = folder.path || '';
      }
    }

    if (action === 'copy') {
      const assets = await MediaAsset.find({ _id: { $in: ids } });
      const duplicates = await Promise.all(assets.map(async (asset) => {
        return await MediaAsset.create({
          imageId: `${asset.imageId}-copy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          originalFilename: `${asset.originalFilename} (Copy)`,
          displayName: `${asset.displayName || asset.originalFilename} (Copy)`,
          storedName: `${asset.storedName}-copy-${Date.now()}`,
          url: asset.url,
          thumbnailUrl: asset.thumbnailUrl,
          mediumUrl: asset.mediumUrl,
          folderId: resolvedFolderId,
          folderName,
          folderPath,
          uploadedBy: asset.uploadedBy,
          metadata: asset.metadata,
          altText: asset.altText,
        });
      }));

      console.log(`[admin:media-move] copied ${ids.length} asset(s) -> folder "${folderName}"`);
      return NextResponse.json({ success: true, count: duplicates.length });
    }

    // Default: move
    const result = await MediaAsset.updateMany(
      { _id: { $in: ids } },
      { 
        $set: { 
          folderId: resolvedFolderId,
          folderName,
          folderPath,
          isDeleted: false,
          deletedAt: null
        } 
      }
    );

    console.log(`[admin:media-move] moved ${ids.length} asset(s) -> folder "${folderName}"`);

    return NextResponse.json({ success: true, count: result.modifiedCount });
  } catch (error: any) {
    console.error('[admin:media-move] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
