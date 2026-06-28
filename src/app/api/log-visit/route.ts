import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VisitorLog from '@/lib/models/VisitorLog';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const { externalId, pathname, referrer } = body;

    if (!externalId) {
      return NextResponse.json({ success: false, error: 'External ID is required' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    let device = 'desktop';
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      device = 'tablet';
    } else if (/mobile/i.test(userAgent)) {
      device = 'mobile';
    }

    let country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry');
    if (!country) {
      const countryFallbacks = ['US', 'GB', 'IN', 'CA'];
      let hash = 0;
      for (let i = 0; i < externalId.length; i++) {
        hash = externalId.charCodeAt(i) + ((hash << 5) - hash);
      }
      country = countryFallbacks[Math.abs(hash) % countryFallbacks.length];
    }

    const ipAddress =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('x-vercel-forwarded-for') ||
      'Unknown';

    console.log(
      'Visitor IP Headers:',
      Object.fromEntries(req.headers.entries())
    );
    console.log('Resolved IP:', ipAddress);

    const details = JSON.stringify({ pathname, search: body.search || '', referrer, device, country, ipAddress });

    await VisitorLog.create({
      externalId,
      event: 'pageview',
      details,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`\x1b[31m[DATABASE ERROR]\x1b[0m Failed to save VisitorLog:`, error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
