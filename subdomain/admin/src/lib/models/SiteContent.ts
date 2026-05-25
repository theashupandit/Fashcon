import mongoose, { Schema, Document } from 'mongoose';

export interface SiteContentDoc extends Document {
  key: string;
  content: {
    announcement?: {
      text: string;
      linkText: string;
      linkHref: string;
      isActive: boolean;
      gradientStart: string;
      gradientVia: string;
      gradientEnd: string;
      textColor: string;
      accentColor: string;
    };
    home: {
      hero: {
        eyebrow: string;
        title: string;
        subtitle: string;
        primaryCtaLabel: string;
        primaryCtaHref: string;
        secondaryCtaLabel: string;
        secondaryCtaHref: string;
        imageUrl: string;
        imageAssetId: string;
        mobileImageUrl: string;
        mobileImageAssetId: string;
        titleFont: string;
        titleColor: string;
      };
      categories: {
        title: string;
        subtitle: string;
        marqueeItems: string[];
        marqueeLinks: string[];
      };
      store: {
        title: string;
        subtitle: string;
        emptyTitle: string;
        emptyMessage: string;
        pinnedProductIds: string[];
        pinnedProductIdsRow2: string[];
      };
    };
    about: {
      title: string;
      tagline: string;
      intro: string;
      mainText1: string;
      mainText2: string;
      beliefs: string[];
      mission: string;
      vision: string;
      footerTitle: string;
      footerTagline: string;
      imageUrl: string;
      imageAssetId: string;
      imageName?: string;
      imagePost?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export const defaultSiteContent = {
  key: 'global',
  content: {
    announcement: {
      text: 'The Glow Up Edit is Here',
      linkText: 'Unlock 15% Off Your First Order',
      linkHref: '#newsletter',
      isActive: true,
      gradientStart: '#1a052e',
      gradientVia: '#6b0f6c',
      gradientEnd: '#be123c',
      textColor: '#ffffff',
      accentColor: '#FF8FB1',
    },
    home: {
      hero: {
        eyebrow: 'Premium Fashion Finds • 2026 Edition',
        title: 'Elevate Your Everyday Aesthetic',
        subtitle: 'Discover hand-picked fashion edits, insider styling tips, and the season’s most coveted looks.',
        primaryCtaLabel: 'Steal the Look',
        primaryCtaHref: '/categories',
        secondaryCtaLabel: 'Read the Latest',
        secondaryCtaHref: '/blog',
        imageUrl: 'https://picsum.photos/seed/fashion-hero/1920/1080',
        imageAssetId: '',
        mobileImageUrl: '',
        mobileImageAssetId: '',
        titleFont: '',
        titleColor: '',
      },
      categories: {
        title: "What's In Store?",
        subtitle: 'Discover the latest in every category',
        marqueeItems: ['Jewelry', 'Accessories', 'Dresses'],
        marqueeLinks: ['/category/jewelry', '/category/accessories', '/category/dresses'],
      },
      store: {
        title: 'Shop the Trends',
        subtitle: 'The most loved pieces this week',
        emptyTitle: 'Coming Soon',
        emptyMessage: 'Our latest collection is currently being curated.',
        pinnedProductIds: [],
        pinnedProductIdsRow2: [],
      },
      blog: {
        title: 'The Fashcon Feed',
        subtitle: 'Latest editorial edits and fashion reports',
        emptyTitle: 'Stories are being written',
        emptyMessage: 'New blog posts will appear here soon.',
        pinnedBlogIds: [],
      },
    },
    about: {
      title: 'Our Story',
      tagline: 'At Fashcon, fashion is more than clothing — it’s identity, confidence, and self-expression.',
      intro: 'Fashcon was created with a simple vision: to make modern fashion feel iconic, wearable, and accessible for everyday people. In a world full of fast-changing trends, we wanted to build a brand that combines timeless aesthetics with the energy of modern style culture.',
      mainText1: 'From carefully selected outfits to trend-driven collections, every piece at Fashcon is chosen to help people express themselves with confidence. We believe style should feel effortless, bold, and personal — whether it’s a minimal everyday look or a statement outfit.',
      mainText2: 'Our journey started with a passion for fashion inspiration, aesthetics, and digital culture. Over time, that passion evolved into a growing fashion brand focused on delivering stylish, modern, and visually inspiring products for the new generation.',
      beliefs: [
        'Fashion should feel confident, not complicated.',
        'Trends should inspire individuality, not copy it.',
        'Quality visuals and aesthetic experiences matter.',
        'Style is a lifestyle, not just an outfit.'
      ],
      mission: 'To build a fashion destination where modern aesthetics meet everyday confidence.',
      vision: 'To become a globally recognized fashion brand known for iconic style, trend-forward collections, and a strong visual identity.',
      footerTitle: 'Fashcon',
      footerTagline: 'Iconic Fashion',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
      imageAssetId: '',
      imageName: 'Apurva',
      imagePost: 'Founder & Creative Director',
    },
  },
};

const SiteContentSchema = new Schema<SiteContentDoc>(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    content: { type: Schema.Types.Mixed, default: defaultSiteContent.content },
  },
  { timestamps: true }
);

export default (mongoose.models.SiteContent as mongoose.Model<SiteContentDoc>) ||
  mongoose.model<SiteContentDoc>('SiteContent', SiteContentSchema);
