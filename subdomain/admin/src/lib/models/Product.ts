import mongoose, { Schema, Document } from 'mongoose';

export interface IVariant {
  colorName: string;
  colorCode: string;
  variantImage: string;
  variantLink?: string;
  priceOverride?: string;
  inventory?: number;
  isOutOfStock?: boolean;
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
    original: string;
    offer: string;
    currency: string;
    showPricing: boolean;
    priceLabel?: string;
    discountPercentage: number;
  };
  affiliate: {
    mainLink: string;
    platform: string;
    trackingId: string;
    clicks?: number;
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
  rating?: number;
  reviewsCount?: number;
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
    original: { type: String },
    offer: { type: String },
    currency: { type: String, default: 'INR' },
    showPricing: { type: Boolean, default: true },
    priceLabel: { type: String },
    discountPercentage: { type: Number }
  },
  affiliate: {
    mainLink: { type: String, required: false },
    platform: { type: String },
    trackingId: { type: String },
    clicks: { type: Number, default: 0 }
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
      priceOverride: String,
      inventory: { type: Number, default: 0 },
      isOutOfStock: { type: Boolean, default: false },
      clicks: { type: Number, default: 0 }
    }
  ],
  seo: {
    metaTitle: { type: String, maxlength: 60 },
    metaDesc: { type: String, maxlength: 160 },
    keywords: [{ type: String }],
    canonicalUrl: { type: String }
  },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, min: 0, max: 5, default: 4.5 },
  reviewsCount: { type: Number, default: 0 }
}, { 
  timestamps: true 
});

// Auto-calculate discount percentage before saving
ProductSchema.pre('save', async function(this: IProduct) {
  const parsePrice = (val: any) => {
    if (!val) return 0;
    // Extract only numbers and decimal point
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const original = parsePrice(this.prices.original);
  const offer = parsePrice(this.prices.offer);

  if (original && offer && original > offer) {
    this.prices.discountPercentage = Math.round(((original - offer) / original) * 100);
  } else {
    this.prices.discountPercentage = 0;
  }
});

// Force delete model to handle schema changes in development
if (process.env.NODE_ENV === 'development') {
  delete (mongoose.models as any).Product;
}

export const Product = (mongoose.models.Product as mongoose.Model<IProduct>) || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
