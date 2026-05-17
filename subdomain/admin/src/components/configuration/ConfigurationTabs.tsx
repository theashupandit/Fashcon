"use client"

import React from "react"
import { UseFormRegister, FieldErrors, Controller, Control, useWatch } from "react-hook-form"
import { SiteSettingsFormValues } from "@/lib/siteSettingsSchema"
import {
  SectionCard, FieldGroup, Input, Textarea,
  CodeEditor, ImageUploader, Toggle,
  CharCountTextarea, PageSelect,
} from "./ConfigurationComponents"
import { Instagram, Facebook, Mail, Phone, Globe, Tag, ShoppingBag, Scale, AlertTriangle } from "lucide-react"

type TabProps = {
  register: UseFormRegister<SiteSettingsFormValues>
  errors: FieldErrors<SiteSettingsFormValues>
  control: Control<SiteSettingsFormValues>
  setValue: (name: any, value: any) => void
  getValues: (name?: any) => any
}

// ── Tab 1: Brand & General ───────────────────────────────────────────────────
export function TabBrand({ register, errors, control, setValue, getValues }: TabProps) {
  const logoUrl = useWatch({ control, name: "logoUrl" })
  const logoDarkUrl = useWatch({ control, name: "logoDarkUrl" })
  const faviconUrl = useWatch({ control, name: "faviconUrl" })

  return (
    <div className="space-y-6">
      <SectionCard title="Identity" description="Your brand name and global footer copy" icon="🏢">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldGroup label="Brand Name" error={errors.brandName?.message} required>
            <Input {...register("brandName")} placeholder="Fashcon" error={errors.brandName?.message} />
          </FieldGroup>
          <FieldGroup label="Global Footer Text" error={errors.footerText?.message}>
            <Input {...register("footerText")} placeholder="© 2024 Fashcon. All rights reserved." />
          </FieldGroup>
        </div>
      </SectionCard>

      <SectionCard title="Logos & Favicon" description="Images served via Cloudinary CDN" icon="🖼️">
        <div className="space-y-5">
          <ImageUploader
            label="Main Logo (Light Mode)"
            hint="SVG or PNG, recommended 200×60px"
            value={logoUrl}
            onChange={(url) => setValue("logoUrl", url)}
            aspectRatio="16:9"
          />
          <ImageUploader
            label="Dark Mode Logo"
            hint="Used when dark theme is active"
            value={logoDarkUrl}
            onChange={(url) => setValue("logoDarkUrl", url)}
            aspectRatio="16:9"
          />
          <ImageUploader
            label="Favicon"
            hint="ICO, PNG or SVG — 32×32px recommended"
            value={faviconUrl}
            onChange={(url) => setValue("faviconUrl", url)}
          />
        </div>
      </SectionCard>

      <SectionCard title="Social Media Links" description="Used in footer and Open Graph sharing" icon="🔗">
        <div className="space-y-4">
          <FieldGroup label="Instagram" error={errors.instagramUrl?.message}>
            <div className="relative">
              <Instagram className="absolute left-3 top-2.5 w-4 h-4 text-foreground/30" />
              <Input {...register("instagramUrl")} placeholder="https://instagram.com/fashcon" className="pl-9" error={errors.instagramUrl?.message} />
            </div>
          </FieldGroup>
          <FieldGroup label="Pinterest" error={errors.pinterestUrl?.message}>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-4 h-4 text-foreground/30" />
              <Input {...register("pinterestUrl")} placeholder="https://pinterest.com/fashcon" className="pl-9" error={errors.pinterestUrl?.message} />
            </div>
          </FieldGroup>
          <FieldGroup label="Facebook" error={errors.facebookUrl?.message}>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-4 h-4 text-foreground/30" />
              <Input {...register("facebookUrl")} placeholder="https://facebook.com/fashcon" className="pl-9" error={errors.facebookUrl?.message} />
            </div>
          </FieldGroup>
        </div>
      </SectionCard>

      <SectionCard title="Contact & Support" description="Admin alerts and public-facing contact info" icon="📬">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldGroup label="Admin Alert Email" hint="Contact form submissions are sent here" error={errors.adminContactEmail?.message}>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-foreground/30" />
              <Input {...register("adminContactEmail")} placeholder="admin@fashcon.com" className="pl-9" error={errors.adminContactEmail?.message} />
            </div>
          </FieldGroup>
          <FieldGroup label="Public Support Email" hint="Displayed in the website footer" error={errors.supportEmail?.message}>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-foreground/30" />
              <Input {...register("supportEmail")} placeholder="support@fashcon.com" className="pl-9" error={errors.supportEmail?.message} />
            </div>
          </FieldGroup>
          <FieldGroup label="Support Phone" error={errors.supportPhone?.message}>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-foreground/30" />
              <Input {...register("supportPhone")} placeholder="+91 98765 43210" className="pl-9" error={errors.supportPhone?.message} />
            </div>
          </FieldGroup>
        </div>
      </SectionCard>
    </div>
  )
}

// ── Tab 2: SEO ───────────────────────────────────────────────────────────────
export function TabSEO({ register, errors, control, setValue }: TabProps) {
  const ogImageUrl = useWatch({ control, name: "ogImageUrl" })

  return (
    <div className="space-y-6">
      <SectionCard title="Meta Tags" description="Default values for search engine results" icon={<Globe className="w-4 h-4" />}>
        <div className="space-y-5">
          <FieldGroup label="Meta Title Tag" hint="Recommended: 50–60 characters" error={errors.metaTitle?.message}>
            <Controller
              name="metaTitle"
              control={control}
              render={({ field }) => (
                <CharCountTextarea
                  {...field}
                  maxLength={70}
                  placeholder="Fashcon | Premium Fashion Curations"
                  className="min-h-[60px]"
                  error={errors.metaTitle?.message}
                  onChange={field.onChange}
                />
              )}
            />
          </FieldGroup>

          <FieldGroup label="Meta Description" hint="Recommended: 150–160 characters" error={errors.metaDescription?.message}>
            <Controller
              name="metaDescription"
              control={control}
              render={({ field }) => (
                <CharCountTextarea
                  {...field}
                  maxLength={160}
                  placeholder="Discover the latest in premium fashion and luxury lifestyle..."
                  className="min-h-[100px]"
                  error={errors.metaDescription?.message}
                  onChange={field.onChange}
                />
              )}
            />
          </FieldGroup>
        </div>
      </SectionCard>

      <SectionCard title="Social Sharing" description="How your site appears on WhatsApp, Twitter, FB" icon="📱">
        <ImageUploader
          label="Open Graph Image"
          hint="Recommended: 1200×630px JPG or PNG"
          value={ogImageUrl}
          onChange={(url) => setValue("ogImageUrl", url)}
          aspectRatio="16:9"
        />
      </SectionCard>

      <SectionCard title="Webmaster Tools" description="Verification tags for site ownership" icon={<Tag className="w-4 h-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldGroup label="Google Analytics ID" hint="G-XXXXXXXXXX">
            <Input {...register("googleAnalyticsId")} placeholder="G-A1B2C3D4E5" />
          </FieldGroup>
          <FieldGroup label="Google Search Console" hint="HTML tag value">
            <Input {...register("googleSearchConsoleTag")} placeholder="xxxx-xxxx-xxxx-xxxx" />
          </FieldGroup>
          <FieldGroup label="Pinterest Verification" hint="HTML tag value">
            <Input {...register("pinterestVerificationTag")} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </FieldGroup>
        </div>
      </SectionCard>

      <SectionCard title="Custom Scripts" description="Inject raw HTML/JS into all pages" icon="💻">
        <div className="space-y-5">
          <CodeEditor
            label="Head Scripts"
            hint="Placed before </head> — use for pixels, fonts, etc."
            {...register("headScripts")}
          />
          <CodeEditor
            label="Body Scripts"
            hint="Placed before </body> — use for widgets, chat tools"
            {...register("bodyScripts")}
          />
        </div>
      </SectionCard>
    </div>
  )
}

// ── Tab 3: Affiliate ─────────────────────────────────────────────────────────
export function TabAffiliate({ register, errors }: TabProps) {
  return (
    <div className="space-y-6">
      <SectionCard title="Affiliate Meta" description="Global identifiers and disclosures" icon={<ShoppingBag className="w-4 h-4" />}>
        <div className="space-y-5">
          <FieldGroup label="Global Disclaimer" hint="Displayed on all product and blog pages" error={errors.affiliateDisclaimer?.message}>
            <Textarea
              {...register("affiliateDisclaimer")}
              placeholder="As an affiliate, we may earn a commission from qualifying purchases..."
              className="min-h-[100px]"
            />
          </FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FieldGroup label="Amazon Store ID">
              <Input {...register("amazonStoreId")} placeholder="fashcon-21" />
            </FieldGroup>
            <FieldGroup label="Myntra Tracking ID">
              <Input {...register("myntraTrackingId")} placeholder="fashcon_myntra" />
            </FieldGroup>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

// ── Tab 4: Legal ─────────────────────────────────────────────────────────────
export function TabLegal({ control, errors }: TabProps) {
  return (
    <div className="space-y-6">
      <SectionCard title="Policy Pages" description="Select the slug for your legal documents" icon={<Scale className="w-4 h-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FieldGroup label="Privacy Policy" error={errors.privacyPolicyPage?.message}>
            <Controller
              name="privacyPolicyPage"
              control={control}
              render={({ field }) => <PageSelect {...field} error={errors.privacyPolicyPage?.message} />}
            />
          </FieldGroup>
          <FieldGroup label="Terms of Service" error={errors.termsPage?.message}>
            <Controller
              name="termsPage"
              control={control}
              render={({ field }) => <PageSelect {...field} error={errors.termsPage?.message} />}
            />
          </FieldGroup>
          <FieldGroup label="Cookie Policy" error={errors.cookiePolicyPage?.message}>
            <Controller
              name="cookiePolicyPage"
              control={control}
              render={({ field }) => <PageSelect {...field} error={errors.cookiePolicyPage?.message} />}
            />
          </FieldGroup>
        </div>
      </SectionCard>
    </div>
  )
}

// ── Tab 5: Advanced ──────────────────────────────────────────────────────────
export function TabAdvanced({ control, onClearCache, clearingCache }: TabProps & { onClearCache: () => void, clearingCache: boolean }) {
  return (
    <div className="space-y-6">
      <SectionCard title="System Controls" description="Global flags and maintenance tools" icon="⚙️">
        <div className="space-y-6 divide-y divide-white/5">
          <div className="pt-0">
            <Controller
              name="maintenanceMode"
              control={control}
              render={({ field }) => (
                <Toggle
                  checked={field.value}
                  onChange={field.onChange}
                  label="Maintenance Mode"
                  description="Disable public access to the storefront with a custom notice."
                  destructive
                />
              )}
            />
          </div>

          <div className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Danger Zone: Purge Cache
                </p>
                <p className="text-[11px] text-foreground/35 mt-0.5">
                  Forces Next.js to revalidate all static pages. Use after critical updates.
                </p>
              </div>
              <button
                type="button"
                onClick={onClearCache}
                disabled={clearingCache}
                className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[11px] font-black uppercase tracking-widest hover:bg-rose-500/20 disabled:opacity-40 transition-all"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
