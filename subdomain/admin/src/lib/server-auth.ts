import { cookies } from 'next/headers';
import ActivityLog from '@/lib/models/Log';
import dbConnect from '@/lib/mongodb';

export async function getServerSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('fashcon_admin_session')?.value;
  if (!session) return null;
  const parts = session.split('::');
  if (parts.length < 3) return null;
  const [email, role, timestamp] = parts;
  const expireTime = parseInt(timestamp, 10);
  if (isNaN(expireTime) || Date.now() > expireTime) return null;
  return { email, role };
}

export async function requireAdmin() {
  const session = await getServerSession();
  if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
    throw new Error('Unauthorized: Admin access required');
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await getServerSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Unauthorized: Super Admin access required');
  }
  return session;
}

export async function logAdminAction(action: string, details: string, type: 'info' | 'warning' | 'critical' = 'info') {
  const session = await getServerSession();
  if (!session) return;
  await dbConnect();
  await ActivityLog.create({
    user: session.email,
    userRole: session.role,
    action,
    details,
    type,
    timestamp: new Date()
  });
}
