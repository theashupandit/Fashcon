import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  image: string;
  headerImage?: string;
  blogType: 'infographic' | 'richtext';
  sections: any[];
  content: string;
  tags: string[];
  keywords: string[];
  metaDescription: string;
  status: 'published' | 'draft' | 'scheduled';
  scheduledAt?: Date;
  author: string;
  views: number;
  productCards: any[];
  adProducts?: any[];
  clicks: number;
  cardInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  cardInfo: { type: String },
  category: { type: String, required: true },
  image: { type: String },
  headerImage: { type: String },
  blogType: { type: String, enum: ['infographic', 'richtext'], default: 'infographic' },
  sections: { type: [Schema.Types.Mixed], default: [] },
  content: { type: String, default: '' },
  tags: { type: [String], default: [] },
  keywords: { type: [String], default: [] },
  metaDescription: { type: String, default: '', maxlength: 160 },
  status: { type: String, enum: ['published', 'draft', 'scheduled'], default: 'draft' },
  scheduledAt: { type: Date },
  author: { type: String, default: 'Admin' },
  views: { type: Number, default: 0 },
  productCards: { type: [Schema.Types.Mixed], default: [] },
  adProducts: { type: [Schema.Types.Mixed], default: [] },
  clicks: { type: Number, default: 0 },
}, { 
  timestamps: true 
});

// Force re-registration if field is missing (useful for dev/hot-reload)
if (mongoose.models.Blog && (!mongoose.models.Blog.schema.path('headerImage') || !mongoose.models.Blog.schema.path('blogType'))) {
  delete mongoose.models.Blog;
}

export const Blog = (mongoose.models.Blog as mongoose.Model<IBlog>) || mongoose.model<IBlog>('Blog', BlogSchema);
export default Blog;
