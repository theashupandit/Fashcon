'use server';

import dbConnect from '@/lib/mongodb';
import VisitorLog from '@/lib/models/VisitorLog';

export async function getVisitorLogs() {
  await dbConnect();
  const logs = await VisitorLog.find({}).sort({ timestamp: -1 }).limit(100);
  return JSON.parse(JSON.stringify(logs));
}

export async function purgeVisitorLogs() {
  await dbConnect();
  await VisitorLog.deleteMany({});
  return { success: true };
}
