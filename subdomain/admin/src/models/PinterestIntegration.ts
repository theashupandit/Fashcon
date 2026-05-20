import mongoose, { Schema, Document } from 'mongoose';

export interface IPinterestIntegration extends Document {
  accountId: string;
  username?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  savedBoards: {
    boardId: string;
    name: string;
    url?: string;
    pinCount?: number;
    followerCount?: number;
  }[];
  isActive: boolean;
  geminiApiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pinterestIntegrationSchema = new Schema({
  accountId: { type: String, required: true },
  username: { type: String },
  // Secure OAuth Tokens
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  tokenExpiresAt: { type: Date, required: true },
  
  // Cache of your boards so the UI loads instantly
  savedBoards: [{
    boardId: String,
    name: String,
    url: String,
    pinCount: Number,
    followerCount: Number
  }],
  isActive: { type: Boolean, default: true },
  geminiApiKey: { type: String }
}, { timestamps: true });

export const PinterestIntegration = mongoose.models.PinterestIntegration || mongoose.model<IPinterestIntegration>('PinterestIntegration', pinterestIntegrationSchema);
