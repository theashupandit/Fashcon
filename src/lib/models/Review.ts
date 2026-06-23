import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  reviewerName: string;
  reviewerEmail?: string;
  rating: number;
  comment: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  reviewerName: { type: String, required: true },
  reviewerEmail: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  image: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }
}, {
  timestamps: true
});

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Review;
}

export const Review = (mongoose.models.Review as mongoose.Model<IReview>) || mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
