import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MediaAsset from '@/lib/models/MediaAsset';
import { cloudinary } from '@/lib/cloudinary-server';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { assetId, newName } = await req.json();

    if (!assetId || !newName?.trim()) {
      return NextResponse.json({ error: 'Asset ID and new name are required' }, { status: 400 });
    }

    const asset = await MediaAsset.findById(assetId);
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Update display name and original filename in MongoDB
    const trimmedName = newName.trim();
    asset.displayName = trimmedName;
    asset.originalFilename = trimmedName;
    await asset.save();

    console.log(`[admin:media-rename] renamed asset ${assetId} -> "${trimmedName}"`);

    return NextResponse.json(asset);
  } catch (error: any) {
    console.error('[admin:media-rename] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
