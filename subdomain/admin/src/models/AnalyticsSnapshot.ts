import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsSnapshot extends Document {
  date: Date;
  visitors: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  revenue: number;
  source: string;
}

const analyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>({
  date: { type: Date, required: true },
  visitors: { type: Number, default: 0 },
  pageviews: { type: Number, default: 0 },
  bounceRate: { type: Number, default: 0 },
  avgSessionDuration: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  source: { type: String, required: true }
});

export const AnalyticsSnapshot = mongoose.models.AnalyticsSnapshot || mongoose.model<IAnalyticsSnapshot>('AnalyticsSnapshot', analyticsSnapshotSchema);
