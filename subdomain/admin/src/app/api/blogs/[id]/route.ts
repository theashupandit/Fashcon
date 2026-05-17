import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  try {
    const blog = await Blog.findById(id);
    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    return NextResponse.json(blog);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  try {
    const data = await req.json();
    const blog = await Blog.findByIdAndUpdate(id, data, { new: true });
    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    return NextResponse.json(blog);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  try {
    await Blog.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
