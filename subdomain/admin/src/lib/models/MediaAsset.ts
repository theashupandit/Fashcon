import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMediaAsset extends Document {
  imageId: string;
  originalFilename: string;
  displayName: string;
  storedName: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  folderId: mongoose.Types.ObjectId | null;
  folderName?: string;
  folderPath?: string;
  uploadedBy: mongoose.Types.ObjectId;
  metadata: {
    size: number; // In Kilobytes (KB)
    format: string; // e.g., 'webp'
    dimensions: string; // e.g., '1200x800'
  };
  altText: string;
  usageCount: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const mediaAssetSchema = new Schema<IMediaAsset>({
  imageId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  originalFilename: { 
    type: String, 
    required: true 
  },
  displayName: {
    type: String,
    required: true,
    default: ''
  },
  storedName: { 
    type: String, 
    required: true, 
    unique: true 
    // Example: "adminId_timestamp_filename.webp"
  },
  url: { 
    type: String, 
    required: true // Cloudinary Secure URL
  },
  thumbnailUrl: {
    type: String // Cloudinary 150px version
  },
  mediumUrl: {
    type: String // Cloudinary 600px version
  },
  folderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Folder', 
    default: null // Null means it is in the root directory
  },
  folderName: {
    type: String,
    default: ''
  },
  folderPath: {
    type: String,
    default: ''
  },
  uploadedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', // Changed from Admin to User to match existing models
    required: true 
  },
  metadata: {
    size: { type: Number }, // In Kilobytes (KB)
    format: { type: String }, // e.g., 'webp', 'avif'
    dimensions: { type: String } // e.g., '1200x800'
  },
  altText: { 
    type: String, 
    default: '' 
  },
  usageCount: { 
    type: Number, 
    default: 0 
  },
  
  // Trash & Soft Delete System
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date, 
    default: null 
  }
}, { timestamps: true });

// Create text indexes for fast search
mediaAssetSchema.index({ originalFilename: 'text', altText: 'text' });
mediaAssetSchema.index({ imageId: 1 }, { unique: true });

const MediaAsset: Model<IMediaAsset> = mongoose.models.MediaAsset || mongoose.model<IMediaAsset>('MediaAsset', mediaAssetSchema);

export default MediaAsset;
