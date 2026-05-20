import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import Product from './models/Product';
import dbConnect from './mongodb';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
console.log('Using MONGODB_URI:', MONGODB_URI ? 'FOUND' : 'MISSING');

const sampleProducts = [
  {
    title: "Silk Midi Dress with Bow Detail",
    slug: "silk-midi-dress-bow-detail",
    brand: "Gucci",
    description: "A stunning silk midi dress featuring a delicate bow detail at the waist. Perfect for garden parties and high-end events.",
    category: "Dresses",
    collections: ["Summer 2024", "Luxury Essentials"],
    badge: "Luxury",
    status: "published",
    prices: {
      original: 120000,
      offer: 95000
    },
    affiliate: {
      mainLink: "https://www.farfetch.com/gucci-silk-midi-dress",
      platform: "Farfetch",
      trackingId: "fashcon-21"
    },
    ctaText: "Shop on Farfetch",
    media: {
      mainImage: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1539109132382-381bb3f1c2b3?q=80&w=1000&auto=format&fit=crop"
      ]
    },
    variants: [
      {
        colorName: "Emerald Green",
        colorCode: "#50C878",
        variantImage: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop"
      },
      {
        colorName: "Midnight Blue",
        colorCode: "#191970",
        variantImage: "https://images.unsplash.com/photo-1539109132382-381bb3f1c2b3?q=80&w=1000&auto=format&fit=crop"
      }
    ],
    seo: {
      metaTitle: "Gucci Silk Midi Dress | Fashcon Luxury",
      metaDesc: "Discover the Gucci Silk Midi Dress at Fashcon. A masterpiece of luxury fashion.",
      keywords: ["Gucci", "Silk Dress", "Luxury Fashion"]
    },
    isFeatured: true
  },
  {
    title: "Diamond Encrusted Gold Necklace",
    slug: "diamond-encrusted-gold-necklace",
    brand: "Cartier",
    description: "Elegant 18k yellow gold necklace adorned with brilliant-cut diamonds. A timeless piece for any jewelry collection.",
    category: "Jewelry",
    collections: ["Fine Jewelry", "Gift Guide"],
    badge: "Hot Sale",
    status: "published",
    prices: {
      original: 450000,
      offer: 420000
    },
    affiliate: {
      mainLink: "https://www.cartier.com/necklace",
      platform: "Cartier",
      trackingId: "fashcon-jewel"
    },
    ctaText: "Explore at Cartier",
    media: {
      mainImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop",
      gallery: []
    },
    variants: [],
    seo: {
      metaTitle: "Cartier Diamond Gold Necklace | Fashcon",
      metaDesc: "Shop the exquisite Cartier Diamond Necklace. Luxury jewelry at its finest.",
      keywords: ["Cartier", "Diamond Necklace", "Gold Jewelry"]
    },
    isFeatured: true
  },
  {
    title: "Leather Quilted Handbag",
    slug: "leather-quilted-handbag",
    brand: "Chanel",
    description: "Classic quilted leather handbag with gold-tone hardware. The ultimate icon of style and sophistication.",
    category: "Bags",
    collections: ["Iconic Bags"],
    badge: "None",
    status: "published",
    prices: {
      original: 680000,
      offer: 680000
    },
    affiliate: {
      mainLink: "https://www.chanel.com/handbags",
      platform: "Chanel",
      trackingId: "fashcon-bags"
    },
    ctaText: "View on Chanel",
    media: {
      mainImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
      gallery: []
    },
    variants: [],
    seo: {
      metaTitle: "Chanel Quilted Handbag | Fashcon",
      metaDesc: "The classic Chanel Quilted Handbag. A must-have for every luxury enthusiast.",
      keywords: ["Chanel", "Handbag", "Luxury Bags"]
    },
    isFeatured: false
  }
];

async function seedProducts() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined');
    
    // Add fashcon database if not in URI
    const connectionUri = uri.includes('.net/') ? uri.replace('.net/', '.net/fashcon') : uri;

    console.log('Connecting to MongoDB...');
    await mongoose.connect(connectionUri);
    
    console.log('Connected to:', mongoose.connection.name);
    
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    
    console.log('Seeding products...');
    await Product.insertMany(sampleProducts);
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
