import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SiteContent, { defaultSiteContent } from '@/lib/models/SiteContent';

function deepMerge<T extends Record<string, any>>(base: T, patch: Partial<T>): T {
  const output: Record<string, any> = Array.isArray(base) ? [...base] : { ...base };

  Object.entries(patch || {}).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value) && base?.[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      output[key] = deepMerge(base[key], value);
    } else if (value !== undefined) {
      output[key] = value;
    }
  });

  return output as T;
}

export async function GET() {
  try {
    await dbConnect();
    const doc = await SiteContent.findOneAndUpdate(
      { key: defaultSiteContent.key },
      { $setOnInsert: defaultSiteContent },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    console.log('[admin:site-content] fetched homepage content from Mongo');
    return NextResponse.json(doc || defaultSiteContent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const contentPatch = body?.content || body;

    const current = await SiteContent.findOneAndUpdate(
      { key: defaultSiteContent.key },
      { $setOnInsert: defaultSiteContent },
      { upsert: true, returnDocument: 'after' }
    );

    const mergedContent = deepMerge(current.content || defaultSiteContent.content, contentPatch);

    const updated = await SiteContent.findOneAndUpdate(
      { key: defaultSiteContent.key },
      { $set: { key: defaultSiteContent.key, content: mergedContent } },
      { upsert: true, returnDocument: 'after' }
    );

    console.log('[admin:site-content] saved homepage content to Mongo');
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
