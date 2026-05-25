import mongoose, { Schema, Document } from 'mongoose';

export interface IIndexIssue extends Document {
  url: string;
  status: 'indexed' | 'noindex' | 'excluded' | 'error';
  reason?: string;
  lastCrawled?: Date;
  discovered: Date;
  resolved: boolean;
}

const indexIssueSchema = new Schema<IIndexIssue>({
  url: { type: String, required: true },
  status: { type: String, enum: ['indexed', 'noindex', 'excluded', 'error'], required: true },
  reason: String,
  lastCrawled: Date,
  discovered: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false }
});

export const IndexIssue = mongoose.models.IndexIssue || mongoose.model<IIndexIssue>('IndexIssue', indexIssueSchema);
