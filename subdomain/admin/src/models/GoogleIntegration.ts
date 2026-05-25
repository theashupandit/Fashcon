import mongoose, { Schema, Document } from 'mongoose';

export interface IGoogleIntegration extends Document {
  service: 'analytics' | 'search_console' | 'pagespeed';
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  config: Record<string, any>;
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const googleIntegrationSchema = new Schema<IGoogleIntegration>({
  service: { type: String, required: true, enum: ['analytics', 'search_console', 'pagespeed'] },
  isConnected: { type: Boolean, default: false },
  accessToken: { type: String },
  refreshToken: { type: String },
  tokenExpiry: { type: Date },
  config: { type: Schema.Types.Mixed, default: {} },
  lastSync: { type: Date },
}, { timestamps: true });

export const GoogleIntegration = mongoose.models.GoogleIntegration || mongoose.model<IGoogleIntegration>('GoogleIntegration', googleIntegrationSchema);
