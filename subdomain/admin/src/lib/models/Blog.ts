import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  image: string;
  thumbnailImage?: string;
  headerImage?: string;
  sections: any[];
  tags: string[];
  status: 'published' | 'draft';
  author: string;
  views: number;
  cardInfo?: string;
  metaDescription?: string;
  keywords?: string[];
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
  thumbnailImage: { type: String },
  headerImage: { type: String },
  sections: { type: [Schema.Types.Mixed], default: [] },
  tags: { type: [String], default: [] },
  metaDescription: { type: String, default: '' },
  keywords: { type: [String], default: [] },
  status: { type: String, enum: ['published', 'draft'], default: 'draft' },
  author: { type: String, default: 'Admin' },
  views: { type: Number, default: 0 },
}, { 
  timestamps: true 
});

// Force re-registration if field is missing (useful for dev/hot-reload)
if (mongoose.models.Blog && (!mongoose.models.Blog.schema.path('headerImage') || !mongoose.models.Blog.schema.path('thumbnailImage'))) {
  delete mongoose.models.Blog;
}

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
export default Blog;
