'use server';

import dbConnect from '@/lib/mongodb';
import VisitorLog from '@/lib/models/VisitorLog';
import { headers } from 'next/headers';

export async function logVisitorEvent(data: {
  externalId: string;
  event: string;
  email?: string;
  details?: string;
}) {
  try {
    await dbConnect();
    
    // Extract request headers to detect device and country
    const reqHeaders = await headers();
    const userAgent = reqHeaders.get('user-agent') || '';
    
    let device = 'desktop';
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      device = 'tablet';
    } else if (/mobile/i.test(userAgent)) {
      device = 'mobile';
    }

    let country = reqHeaders.get('x-vercel-ip-country') || reqHeaders.get('cf-ipcountry');
    if (!country) {
      // Local development fallback: assign a country deterministically based on externalId
      const countryFallbacks = ['US', 'GB', 'IN', 'CA'];
      let hash = 0;
      for (let i = 0; i < data.externalId.length; i++) {
        hash = data.externalId.charCodeAt(i) + ((hash << 5) - hash);
      }
      country = countryFallbacks[Math.abs(hash) % countryFallbacks.length];
    }

    const ipAddress =
      reqHeaders.get('cf-connecting-ip') ||
      reqHeaders.get('x-forwarded-for')?.split(',')[0].trim() ||
      reqHeaders.get('x-real-ip') ||
      reqHeaders.get('x-vercel-forwarded-for') ||
      'Unknown';

    console.log(
      'Visitor Action IP Headers:',
      Object.fromEntries(reqHeaders.entries())
    );
    console.log('Resolved Action IP:', ipAddress);

    // Merge device and country into details object
    let detailsObj: any = {};
    if (data.details) {
      try {
        detailsObj = JSON.parse(data.details);
      } catch (e) {
        detailsObj = { raw: data.details };
      }
    }
    detailsObj.device = device;
    detailsObj.country = country;
    detailsObj.ipAddress = ipAddress;

    const log = await VisitorLog.create({
      externalId: data.externalId,
      event: data.event,
      email: data.email || undefined,
      details: JSON.stringify(detailsObj),
    });
    return { success: true, logId: log._id.toString() };
  } catch (error: any) {
    console.error('Failed to log visitor event:', error);
    return { success: false, error: error.message };
  }
}
