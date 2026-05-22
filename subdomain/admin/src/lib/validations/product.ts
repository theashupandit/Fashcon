import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase letters, numbers, and hyphens only, e.g. "sleeveless-midi-dress")'),
  brand: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  collections: z.array(z.string()),
  tags: z.array(z.string()).optional().default([]),
  badge: z.enum(["None", "Luxury", "Hot Sale", "New Arrival"]),
  status: z.enum(["draft", "published"]),
  prices: z.object({
    original: z.string().optional().or(z.literal('')),
    offer: z.string().optional().or(z.literal('')),
    currency: z.enum(['INR', 'USD']).default('INR'),
    showPricing: z.boolean().default(true),
    priceLabel: z.string().optional(),
  }).optional(),
  affiliate: z.object({
    mainLink: z.string().optional().or(z.literal('')),
    platform: z.string().optional(),
    trackingId: z.string().optional(),
    clicks: z.number().optional(),
  }).optional(),
  ctaText: z.string().optional(),
  media: z.object({
    mainImage: z.string().min(1, 'Main image is required'),
    gallery: z.array(z.string()),
    blurDataURL: z.string().optional(),
  }),
  variants: z.array(z.object({
    colorName: z.string(),
    colorCode: z.string(),
    variantImage: z.string(),
    variantLink: z.string().url('Invalid variant URL').optional().or(z.literal('')),
    priceOverride: z.string().optional(),
    inventory: z.number().min(0).optional().default(0),
    isOutOfStock: z.boolean().optional().default(false),
    clicks: z.number().optional(),
  })),
  seo: z.object({
    metaTitle: z.string().max(60, 'Meta title must be max 60 chars').optional(),
    metaDesc: z.string().max(160, 'Meta description must be max 160 chars').optional(),
    keywords: z.array(z.string()),
    canonicalUrl: z.string().url('Invalid canonical URL').optional().or(z.literal('')),
  }),
  isFeatured: z.boolean(),
  rating: z.number().min(0).max(5).optional().default(4.5),
  reviewsCount: z.number().min(0).optional().default(0),
});

export type ProductFormValues = z.infer<typeof productSchema>;
