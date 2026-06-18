'use server';

import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import ActivityLog from '@/lib/models/Log';
import Message from '@/lib/models/Message';
import Subscription from '@/lib/models/Subscription';
import VisitorLog from '@/lib/models/VisitorLog';
import Product from '@/lib/models/Product';
import { requireAdmin } from '@/lib/server-auth';

export async function getDashboardNotifications() {
  try {
    await requireAdmin();
  } catch {
    // If not authenticated as admin, return empty array to prevent leak
    return [];
  }
  
  await dbConnect();
  
  const notifications: any[] = [];
  
  // 1. Fetch recent activity logs (limit: 6)
  try {
    const logs = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(6);
    logs.forEach(log => {
      let type = 'info';
      if (log.type === 'critical') type = 'error';
      else if (log.type === 'warning') type = 'warning';
      else if (log.action.includes('Create') || log.action.includes('Sync') || log.action.includes('Regenerate')) type = 'success';
      
      notifications.push({
        id: `activity-${log._id}`,
        title: log.action,
        desc: log.details || `${log.userRole} did ${log.action}`,
        timestamp: log.timestamp || new Date(),
        type,
        category: 'Activity'
      });
    });
  } catch (e) {
    console.error('Error fetching ActivityLogs for notifications:', e);
  }

  // 2. Fetch recent inbox messages (limit: 6)
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 }).limit(6);
    messages.forEach(msg => {
      notifications.push({
        id: `message-${msg._id}`,
        title: 'New Contact Message',
        desc: `Message from ${msg.name} (${msg.email}): "${msg.subject}"`,
        timestamp: msg.createdAt || new Date(),
        type: 'info',
        category: 'Inbox'
      });
    });
  } catch (e) {
    console.error('Error fetching Messages for notifications:', e);
  }

  // 3. Fetch recent newsletter subscriptions (limit: 6)
  try {
    const subscriptions = await Subscription.find({}).sort({ createdAt: -1 }).limit(6);
    subscriptions.forEach(sub => {
      notifications.push({
        id: `sub-${sub._id}`,
        title: 'Newsletter Signup',
        desc: `${sub.email} subscribed to updates.`,
        timestamp: sub.createdAt || new Date(),
        type: 'success',
        category: 'Newsletter'
      });
    });
  } catch (e) {
    console.error('Error fetching Subscriptions for notifications:', e);
  }

  // 4. Fetch recent affiliate clicks / leads (limit: 6)
  try {
    const visitorLogs = await VisitorLog.find({ event: { $in: ['lead', 'affiliate_click'] } }).sort({ timestamp: -1 }).limit(6);
    visitorLogs.forEach(v => {
      let details: any = {};
      try {
        details = JSON.parse(v.details || '{}');
      } catch {}
      
      notifications.push({
        id: `click-${v._id}`,
        title: 'Affiliate Lead Tracked',
        desc: `Visitor ${v.externalId.substring(0, 10)}... clicked Buy Link for ${details.product_name || 'Affiliate Product'}`,
        timestamp: v.timestamp || new Date(),
        type: 'success',
        category: 'Pinterest'
      });
    });
  } catch (e) {
    console.error('Error fetching VisitorLogs for notifications:', e);
  }

  // 5. Fetch low inventory products (limit: 6)
  try {
    const lowInventoryProducts = await Product.find({
      isDeleted: { $ne: true },
      $or: [
        { 'variants.inventory': { $lt: 5, $gt: 0 } },
        { 'variants.isOutOfStock': true }
      ]
    }).limit(6);
    
    lowInventoryProducts.forEach(p => {
      const outOfStockVariants = p.variants?.filter((v: any) => v.inventory < 5 || v.isOutOfStock) || [];
      const desc = outOfStockVariants.length > 0 
        ? `Product "${p.title}" has low stock variants: ${outOfStockVariants.map((v: any) => `${v.colorName} (${v.inventory} left)`).join(', ')}`
        : `Product "${p.title}" is running low on stock.`;

      notifications.push({
        id: `inv-${p._id}`,
        title: 'Inventory Alert',
        desc,
        timestamp: p.updatedAt || new Date(),
        type: 'warning',
        category: 'Inventory'
      });
    });
  } catch (e) {
    console.error('Error fetching low inventory products for notifications:', e);
  }

  // Sort all notifications by timestamp descending
  notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Return the top 25 notifications
  return JSON.parse(JSON.stringify(notifications.slice(0, 25)));
}
