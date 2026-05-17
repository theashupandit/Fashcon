import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: 'product' | 'blog';
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ['product', 'blog'], required: true },
  count: { type: Number, default: 0 },
}, { 
  timestamps: true 
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
