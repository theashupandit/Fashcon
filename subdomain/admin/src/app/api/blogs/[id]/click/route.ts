import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

// Track affiliate product clicks within a blog post
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  try {
    const { productId } = await req.json();
    
    // Increment the blog-level click counter
    await Blog.findByIdAndUpdate(id, { $inc: { clicks: 1 } });

    // If a productId is provided, also increment the specific product card click count
    if (productId) {
      await Blog.findOneAndUpdate(
        { _id: id, 'productCards.productId': productId },
        { $inc: { 'productCards.$.clicks': 1 } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Get click stats for a blog
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  try {
    const blog = await Blog.findById(id).select('clicks productCards');
    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    return NextResponse.json({
      totalClicks: blog.clicks,
      productCards: blog.productCards
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
