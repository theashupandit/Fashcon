import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MediaAsset from '@/lib/models/MediaAsset';
import { subDays } from 'date-fns';

/**
 * Hard delete assets that have been in the trash for more than 30 days
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    // Find assets to delete
    const assetsToDelete = await MediaAsset.find({
      isDeleted: true,
      deletedAt: { $lte: thirtyDaysAgo }
    });
    
    if (assetsToDelete.length === 0) {
      return NextResponse.json({ message: 'No assets to clean up' });
    }
    
    // In a real app, you would also delete from Cloudinary here
    // using cloudinary.api.delete_resources(assetsToDelete.map(a => a.storedName.split('.')[0]))
    
    const result = await MediaAsset.deleteMany({
      _id: { $in: assetsToDelete.map(a => a._id) }
    });
    
    return NextResponse.json({ 
      message: `Successfully cleaned up ${result.deletedCount} assets`,
      count: result.deletedCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
