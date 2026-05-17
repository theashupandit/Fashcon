import mongoose from 'mongoose';
const { Schema } = mongoose;

const competitorIntelSchema = new Schema({
  competitorName: { type: String, required: true },
  domainUrl: { type: String, required: true },
  
  // SEO & Traffic
  estimatedTraffic: { type: Number },
  domainAuthority: { type: Number },
  topKeywords: [{ keyword: String, rank: Number, searchVolume: Number }],
  
  // Social & Brand
  instagramFollowers: { type: Number },
  recentAds: [{ 
    adImageUrl: String, 
    adCopy: String, 
    platform: String, 
    detectedAt: Date 
  }],

  // Tracked Products (Mapping their products to yours)
  trackedProducts: [{
    fashconProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
    competitorPrice: { type: Number },
    inStock: { type: Boolean },
    lastChecked: { type: Date }
  }],

  lastUpdated: { type: Date, default: Date.now }
});

export const CompetitorIntel = mongoose.models.CompetitorIntel || mongoose.model('CompetitorIntel', competitorIntelSchema);
