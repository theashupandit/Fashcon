'use server';

import dbConnect from '@/lib/mongodb';
import ActivityLog from '@/lib/models/Log';

export async function getLogs() {
  await dbConnect();
  const logs = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(100);
  return JSON.parse(JSON.stringify(logs));
}

export async function createLog(data: any) {
  await dbConnect();
  const log = await ActivityLog.create(data);
  return JSON.parse(JSON.stringify(log));
}
