import mongoose, { Schema, Document } from 'mongoose';

export interface ITrendInsight extends Document {
  topic: string;
  category: string;
  growthPercentage: number;
  volume: number;
  source: 'pinterest' | 'google' | 'tiktok';
  status: 'rising' | 'peaking' | 'falling';
  discoveredAt: Date;
}

const trendInsightSchema = new Schema<ITrendInsight>({
  topic: { type: String, required: true },
  category: { type: String, required: true },
  growthPercentage: { type: Number, default: 0 },
  volume: { type: Number, default: 0 },
  source: { type: String, enum: ['pinterest', 'google', 'tiktok'], required: true },
  status: { type: String, enum: ['rising', 'peaking', 'falling'], required: true },
  discoveredAt: { type: Date, default: Date.now }
});

export const TrendInsight = mongoose.models.TrendInsight || mongoose.model<ITrendInsight>('TrendInsight', trendInsightSchema);
