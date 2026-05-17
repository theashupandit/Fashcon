import mongoose, { Schema, Document } from 'mongoose';

export interface IVariant {
  colorName: string;
  colorCode: string;
  variantImage: string;
  variantLink?: string;
  priceOverride?: number;
  clicks?: number;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  brand: string;
  description: string;
  category: string;
  collections: string[];
  badge: 'None' | 'Luxury' | 'Hot Sale' | 'New Arrival';
  status: 'draft' | 'published';
  prices: {
    original: number;
    offer: number;
    discountPercentage: number;
  };
  affiliate: {
    mainLink: string;
    platform: string;
    trackingId: string;
  };
  ctaText: string;
  media: {
    mainImage: string;
    gallery: string[];
    blurDataURL?: string;
  };
  variants: IVariant[];
  seo: {
    metaTitle: string;
    metaDesc: string;
    keywords: string[];
    canonicalUrl?: string;
  };
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  brand: { type: String },
  description: { type: String },
  category: { type: String },
  collections: [{ type: String }],
  badge: { 
    type: String, 
    enum: ["None", "Luxury", "Hot Sale", "New Arrival"],
    default: "None"
  },
  status: { 
    type: String, 
    enum: ["draft", "published"],
    default: "draft"
  },
  prices: {
    original: { type: Number },
    offer: { type: Number },
    discountPercentage: { type: Number }
  },
  affiliate: {
    mainLink: { type: String, required: true },
    platform: { type: String },
    trackingId: { type: String }
  },
  ctaText: { type: String, default: "Buy Now" },
  media: {
    mainImage: { type: String },
    gallery: [{ type: String }],
    blurDataURL: { type: String }
  },
  variants: [
    {
      colorName: String,
      colorCode: String,
      variantImage: String,
      variantLink: String,
      priceOverride: Number,
      clicks: { type: Number, default: 0 }
    }
  ],
  seo: {
    metaTitle: { type: String, maxlength: 60 },
    metaDesc: { type: String, maxlength: 160 },
    keywords: [{ type: String }],
    canonicalUrl: { type: String }
  },
  isFeatured: { type: Boolean, default: false }
}, { 
  timestamps: true 
});

// Auto-calculate discount percentage before saving
ProductSchema.pre('save', function(this: IProduct) {
  if (this.prices.original && this.prices.offer) {
    this.prices.discountPercentage = Math.round(
      ((this.prices.original - this.prices.offer) / this.prices.original) * 100
    );
  }
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
