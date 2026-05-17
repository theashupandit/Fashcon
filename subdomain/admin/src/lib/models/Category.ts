import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: 'product' | 'blog';
  count: number;
  description?: string;
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroAlignment?: 'left' | 'center' | 'right';
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ['product', 'blog'], required: true },
  count: { type: Number, default: 0 },
  description: { type: String },
  heroImage: { type: String },
  heroTitle: { type: String },
  heroSubtitle: { type: String },
  heroAlignment: { 
    type: String, 
    enum: ['left', 'center', 'right'], 
    default: 'left' 
  },
  icon: { type: String, default: 'fa-tag' },
  color: { type: String, default: '#6366f1' },
}, { 
  timestamps: true 
});

const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export default Category;
