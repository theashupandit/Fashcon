import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Folder from '@/lib/models/Folder';
import MediaAsset from '@/lib/models/MediaAsset';
import mongoose from 'mongoose';

import { cloudinary } from '@/lib/cloudinary-server';

async function syncCloudinaryFolders(parentPath: string = '', parentId: string | null = null) {
  const rootPrefix = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'Collection';
  const fullPath = parentPath ? `${rootPrefix}/${parentPath}` : rootPrefix;
  
  try {
    const result = await cloudinary.api.sub_folders(fullPath);
    const cloudFolders = result.folders || [];

    for (const cloudFolder of cloudFolders) {
      const folderName = cloudFolder.name;
      const folderPath = parentPath ? `${parentPath}/${folderName}` : folderName;
      
      let localFolder = await Folder.findOne({ path: folderPath });
      
      if (!localFolder) {
        localFolder = await Folder.create({
          name: folderName,
          parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
          path: folderPath
        });
      }

      // Important: Recurse into this subfolder immediately
      await syncCloudinaryFolders(folderPath, localFolder._id.toString());
    }
  } catch (error: any) {
    console.error(`[admin:media-sync] Error syncing folder ${fullPath}:`, error.message);
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Perform a background sync if requested or just do it (for small trees)
    // To satisfy the user "automatic", we'll do it here. 
    // In a huge tree this should be a separate job, but for most stores this is fine.
    await syncCloudinaryFolders();

    const folders = await Folder.find({}).sort({ name: 1 }).lean();
    return NextResponse.json(folders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, parentId } = body;
    
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    
    let path = `/${name}`;
    if (parentId && mongoose.isValidObjectId(parentId)) {
      const parent = await Folder.findById(parentId);
      if (parent) {
        path = `${parent.path}/${name}`;
      }
    }
    
    const newFolder = await Folder.create({
      name,
      parentId: parentId || null,
      path
    });
    
    return NextResponse.json(newFolder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action'); // 'move' or 'delete'
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const folder = await Folder.findById(id);
    if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    
    // Check if there are subfolders or assets
    const childFolders = await Folder.find({ parentId: id });
    const assets = await MediaAsset.find({ folderId: id });
    
    if (assets.length > 0 || childFolders.length > 0) {
      if (!action) {
        return NextResponse.json({ 
          error: 'Folder is not empty', 
          hasContents: true,
          assetCount: assets.length,
          folderCount: childFolders.length
        }, { status: 400 });
      }
      
      if (action === 'move') {
        // Move assets to root or parent
        const newParentId = folder.parentId || null;
        await MediaAsset.updateMany({ folderId: id }, { folderId: newParentId });
        await Folder.updateMany({ parentId: id }, { parentId: newParentId });
      } else if (action === 'delete') {
        // Soft delete all assets in folder
        await MediaAsset.updateMany({ folderId: id }, { isDeleted: true, deletedAt: new Date() });
        // Recursively delete subfolders? For now just move them up or block
        await Folder.updateMany({ parentId: id }, { parentId: folder.parentId || null });
      }
    }
    
    await Folder.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
