import { z } from "zod"

export const siteSettingsSchema = z.object({
  // Brand & General
  brandName: z.string().min(1, "Brand name is required"),
  footerText: z.string(),
  logoUrl: z.string(),
  logoDarkUrl: z.string(),
  faviconUrl: z.string(),
  instagramUrl: z.string().url("Invalid URL").or(z.literal("")),
  pinterestUrl: z.string().url("Invalid URL").or(z.literal("")),
  facebookUrl: z.string().url("Invalid URL").or(z.literal("")),
  adminContactEmail: z.string().email("Invalid email").or(z.literal("")),
  supportPhone: z.string(),
  supportEmail: z.string().email("Invalid email").or(z.literal("")),

  // Global SEO
  metaTitle: z.string().max(70, "Keep under 70 chars"),
  metaDescription: z.string().max(160, "Keep under 160 chars"),
  fallbackSeoText: z.string(),
  ogImageUrl: z.string(),
  googleAnalyticsId: z.string(),
  googleSearchConsoleTag: z.string(), 
  pinterestVerificationTag: z.string(),
  headScripts: z.string(),
  bodyScripts: z.string(),

  // Affiliate
  affiliateDisclaimer: z.string(),
  amazonStoreId: z.string(),
  myntraTrackingId: z.string(),

  // Legal & Support
  privacyPolicyPage: z.string(),
  termsPage: z.string(),
  cookiePolicyPage: z.string(),

  // Advanced
  maintenanceMode: z.boolean(),
})

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>
