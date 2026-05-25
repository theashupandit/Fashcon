import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchConsoleMetrics extends Document {
  date: Date;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  query?: string;
  page?: string;
}

const searchConsoleMetricsSchema = new Schema<ISearchConsoleMetrics>({
  date: { type: Date, required: true },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 },
  position: { type: Number, default: 0 },
  query: String,
  page: String
});

export const SearchConsoleMetrics = mongoose.models.SearchConsoleMetrics || mongoose.model<ISearchConsoleMetrics>('SearchConsoleMetrics', searchConsoleMetricsSchema);
