import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitorLog extends Document {
  externalId: string;
  event: string;
  email?: string;
  details?: string;
  timestamp: Date;
}

const VisitorLogSchema: Schema = new Schema({
  externalId: { type: String, required: true, index: true },
  event: { type: String, required: true },
  email: { type: String },
  details: { type: String },
}, { 
  timestamps: { createdAt: 'timestamp', updatedAt: false } 
});

export default mongoose.models.VisitorLog || mongoose.model<IVisitorLog>('VisitorLog', VisitorLogSchema);
