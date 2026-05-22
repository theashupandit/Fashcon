import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: 'product' | 'blog';
  count: number;
  description?: string;
  parentCategory?: string;
  heroImage?: string;
  bannerImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroAlignment?: 'left' | 'center' | 'right';
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ['product', 'blog'], required: true },
  count: { type: Number, default: 0 },
  description: { type: String },
  parentCategory: { type: String },
  heroImage: { type: String },
  bannerImage: { type: String },
  heroTitle: { type: String },
  heroSubtitle: { type: String },
  heroAlignment: { 
    type: String, 
    enum: ['left', 'center', 'right'], 
    default: 'left' 
  },
}, { 
  timestamps: true 
});

if (process.env.NODE_ENV === 'development') {
  delete (mongoose.models as any).Category;
}

export const Category = (mongoose.models.Category as mongoose.Model<ICategory>) || mongoose.model<ICategory>('Category', CategorySchema);
export default Category;

