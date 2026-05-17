import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduledPin extends Document {
  productId: mongoose.Types.ObjectId;
  boardId: string;
  imageUrl: string;
  altText?: string;
  destinationUrl: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  scheduledFor: Date;
  status: 'draft' | 'approved' | 'scheduled' | 'published' | 'rejected' | 'failed';
  errorMessage?: string;
  pinterestPinId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const scheduledPinSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  boardId: { type: String, required: true },
  imageUrl: { type: String, required: true }, // The Cloudinary secure_url
  altText: { type: String }, // Accessibility text for Pinterest
  destinationUrl: { type: String, required: true }, // The cloaked /go/product-slug link
  
  // Shoppable Meta
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number }, 
  currency: { type: String, default: 'INR' },
  
  scheduledFor: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'approved', 'scheduled', 'published', 'rejected', 'failed'], 
    default: 'draft' 
  },
  errorMessage: { type: String }, // If the API rejects it, log why here
  pinterestPinId: { type: String } // Store the created Pin ID
}, { timestamps: true });

export const ScheduledPin = mongoose.models.ScheduledPin || mongoose.model<IScheduledPin>('ScheduledPin', scheduledPinSchema);
