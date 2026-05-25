import mongoose, { Schema, Document } from 'mongoose';

export interface ICoreWebVitalsSnapshot extends Document {
  url: string;
  device: 'mobile' | 'desktop';
  lcp: number;
  cls: number;
  inp: number;
  fcp: number;
  ttfb: number;
  score: number;
  timestamp: Date;
}

const coreWebVitalsSnapshotSchema = new Schema<ICoreWebVitalsSnapshot>({
  url: { type: String, required: true },
  device: { type: String, enum: ['mobile', 'desktop'], required: true },
  lcp: { type: Number, default: 0 },
  cls: { type: Number, default: 0 },
  inp: { type: Number, default: 0 },
  fcp: { type: Number, default: 0 },
  ttfb: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

export const CoreWebVitalsSnapshot = mongoose.models.CoreWebVitalsSnapshot || mongoose.model<ICoreWebVitalsSnapshot>('CoreWebVitalsSnapshot', coreWebVitalsSnapshotSchema);
