import mongoose, { Schema, Document } from 'mongoose';

export interface IAffiliateLink extends Document {
  label: string;
  url: string;
  merchant: string;
  clicks: number;
  earnings: number;
  status: 'active' | 'expired';
  lastClicked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateLinkSchema: Schema = new Schema({
  label: { type: String, required: true },
  url: { type: String, required: true },
  merchant: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'expired'], default: 'active' },
  lastClicked: { type: Date },
}, { 
  timestamps: true 
});

export const AffiliateLink = mongoose.models.AffiliateLink || mongoose.model<IAffiliateLink>('AffiliateLink', AffiliateLinkSchema);
export default AffiliateLink;
