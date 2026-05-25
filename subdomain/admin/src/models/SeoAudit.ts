import mongoose, { Schema, Document } from 'mongoose';

export interface ISeoAudit extends Document {
  url: string;
  score: number;
  issues: {
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    element?: string;
  }[];
  timestamp: Date;
}

const seoAuditSchema = new Schema<ISeoAudit>({
  url: { type: String, required: true },
  score: { type: Number, required: true },
  issues: [{
    type: { type: String, enum: ['error', 'warning', 'info'] },
    category: String,
    message: String,
    element: String
  }],
  timestamp: { type: Date, default: Date.now }
});

export const SeoAudit = mongoose.models.SeoAudit || mongoose.model<ISeoAudit>('SeoAudit', seoAuditSchema);
