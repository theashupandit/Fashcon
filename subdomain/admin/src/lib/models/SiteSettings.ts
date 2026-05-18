import mongoose, { Schema, Document, Model } from "mongoose"

export interface ISiteSettings extends Document {
  // Brand & General
  brandName: string
  footerText: string
  logoUrl: string
  logoDarkUrl: string
  faviconUrl: string
  instagramUrl: string
  pinterestUrl: string
  facebookUrl: string
  adminContactEmail: string
  supportPhone: string
  supportEmail: string

  // Global SEO
  metaTitle: string
  metaDescription: string
  fallbackSeoText: string
  ogImageUrl: string
  googleAnalyticsId: string
  googleSearchConsoleTag: string
  pinterestVerificationTag: string
  headScripts: string
  bodyScripts: string

  // Affiliate Configuration
  affiliateDisclaimer: string
  amazonStoreId: string
  myntraTrackingId: string

  // Legal & Support
  privacyPolicyPage: string
  termsPage: string
  cookiePolicyPage: string

  // Advanced
  maintenanceMode: boolean
  loginRequired: boolean
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    // Brand & General
    brandName: { type: String, default: "Fashcon" },
    footerText: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    logoDarkUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    pinterestUrl: { type: String, default: "" },
    facebookUrl: { type: String, default: "" },
    adminContactEmail: { type: String, default: "" },
    supportPhone: { type: String, default: "" },
    supportEmail: { type: String, default: "" },

    // Global SEO
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    fallbackSeoText: { type: String, default: "" },
    ogImageUrl: { type: String, default: "" },
    googleAnalyticsId: { type: String, default: "" },
    googleSearchConsoleTag: { type: String, default: "" },
    pinterestVerificationTag: { type: String, default: "" },
    headScripts: { type: String, default: "" },
    bodyScripts: { type: String, default: "" },

    // Affiliate
    affiliateDisclaimer: { type: String, default: "" },
    amazonStoreId: { type: String, default: "" },
    myntraTrackingId: { type: String, default: "" },

    // Legal & Support
    privacyPolicyPage: { type: String, default: "/privacy-policy" },
    termsPage: { type: String, default: "/terms" },
    cookiePolicyPage: { type: String, default: "/cookie-policy" },

    // Advanced
    maintenanceMode: { type: Boolean, default: false },
    loginRequired: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Singleton helper — always upsert the one document
// @ts-ignore
SiteSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne()
  if (!doc) doc = await this.create({})
  return doc
}

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema)

export default SiteSettings
