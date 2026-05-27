'use server';

import dbConnect from '@/lib/mongodb';
import VisitorLog from '@/lib/models/VisitorLog';

export async function logVisitorEvent(data: {
  externalId: string;
  event: string;
  email?: string;
  details?: string;
}) {
  try {
    await dbConnect();
    const log = await VisitorLog.create({
      externalId: data.externalId,
      event: data.event,
      email: data.email || undefined,
      details: data.details || undefined,
    });
    return { success: true, logId: log._id.toString() };
  } catch (error: any) {
    console.error('Failed to log visitor event:', error);
    return { success: false, error: error.message };
  }
}
