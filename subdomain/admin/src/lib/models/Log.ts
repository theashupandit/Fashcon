import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  action: string;
  user: string;
  userRole: string;
  details: string;
  type: 'info' | 'warning' | 'critical';
  timestamp: Date;
}

const ActivityLogSchema: Schema = new Schema({
  action: { type: String, required: true },
  user: { type: String, required: true },
  userRole: { type: String, required: true },
  details: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
}, { 
  timestamps: { createdAt: 'timestamp', updatedAt: false } 
});

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
