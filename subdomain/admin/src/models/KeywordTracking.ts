import mongoose, { Schema, Document } from 'mongoose';

export interface IKeywordTracking extends Document {
  keyword: string;
  category?: string;
  searchVolume: number;
  difficulty: number;
  currentRank: number;
  previousRank: number;
  url: string;
  lastUpdated: Date;
}

const keywordTrackingSchema = new Schema<IKeywordTracking>({
  keyword: { type: String, required: true, unique: true },
  category: { type: String },
  searchVolume: { type: Number, default: 0 },
  difficulty: { type: Number, default: 0 },
  currentRank: { type: Number, default: 0 },
  previousRank: { type: Number, default: 0 },
  url: { type: String },
  lastUpdated: { type: Date, default: Date.now }
});

export const KeywordTracking = mongoose.models.KeywordTracking || mongoose.model<IKeywordTracking>('KeywordTracking', keywordTrackingSchema);
