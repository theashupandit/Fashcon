"use client"

import React, { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { siteSettingsSchema, SiteSettingsFormValues } from "@/lib/siteSettingsSchema"
import { saveSiteSettings, clearNextCache } from "@/app/actions/siteSettings"
import { TabBrand, TabSEO, TabAffiliate, TabLegal, TabAdvanced } from "./ConfigurationTabs"
import { CheckCircle2, Loader2, Save, Trash2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "brand",     label: "Brand & General",      emoji: "🏢" },
  { id: "seo",       label: "Global SEO",            emoji: "🌍" },
  { id: "affiliate", label: "Affiliate Config",      emoji: "🛍️" },
  { id: "legal",     label: "Legal & Support",       emoji: "⚖️" },
  { id: "advanced",  label: "Advanced",              emoji: "⚙️" },
] as const

type TabId = typeof TABS[number]["id"]

interface Props {
  defaultValues: Partial<SiteSettingsFormValues>
}

export default function SiteSettingsPage({ defaultValues }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("brand")
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [clearingCache, setClearingCache] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      brandName: "",
      footerText: "",
      logoUrl: "",
      logoDarkUrl: "",
      faviconUrl: "",
      instagramUrl: "",
      pinterestUrl: "",
      facebookUrl: "",
      adminContactEmail: "",
      supportPhone: "",
      supportEmail: "",
      metaTitle: "",
      metaDescription: "",
      fallbackSeoText: "",
      ogImageUrl: "",
      googleAnalyticsId: "",
      googleSearchConsoleTag: "",
      pinterestVerificationTag: "",
      headScripts: "",
      bodyScripts: "",
      affiliateDisclaimer: "",
      amazonStoreId: "",
      myntraTrackingId: "",
      privacyPolicyPage: "/privacy-policy",
      termsPage: "/terms",
      cookiePolicyPage: "/cookie-policy",
      maintenanceMode: false,
      ...defaultValues,
    },
  })

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  const onSubmit = (data: SiteSettingsFormValues) => {
    startTransition(async () => {
      // @ts-ignore
      const result = await saveSiteSettings(data)
      if (result.success) {
        reset(data) // mark form as clean
        showToast("success", result.message)
      } else {
        showToast("error", result.message)
      }
    })
  }

  const handleClearCache = async () => {
    setClearingCache(true)
    const result = await clearNextCache()
    setClearingCache(false)
    showToast(result.success ? "success" : "error", result.message)
  }

  const tabProps = { register, errors, control, setValue, getValues }

  return (
    <>
      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-foreground/40">
              System Configuration
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Site Settings</h1>
          <p className="text-sm text-foreground/40 font-medium mt-1">
            Singleton configuration — changes propagate across the entire site.
          </p>
        </div>
        {/* Clear Cache button lives in header for quick access */}
        <button
          type="button"
          onClick={handleClearCache}
          disabled={clearingCache}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-rose-500/10 border border-rose-500/25
            text-rose-400 text-[11px] font-black uppercase tracking-widest
            hover:bg-rose-500/20 disabled:opacity-40 transition-all"
        >
          {clearingCache ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          Clear Next.js Cache
        </button>
      </div>

      {/* ── Tab Bar ── */}
      <div className="glass rounded-2xl p-1.5 mb-6 flex gap-1 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-foreground text-background shadow-lg"
                : "text-foreground/45 hover:text-foreground/70 hover:bg-white/5"
            )}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="min-h-[400px]">
          {activeTab === "brand"     && <TabBrand     {...tabProps} />}
          {activeTab === "seo"       && <TabSEO       {...tabProps} />}
          {activeTab === "affiliate" && <TabAffiliate {...tabProps} />}
          {activeTab === "legal"     && <TabLegal     {...tabProps} />}
          {activeTab === "advanced"  && (
            <TabAdvanced
              {...tabProps}
              onClearCache={handleClearCache}
              clearingCache={clearingCache}
            />
          )}
        </div>

        {/* ── Floating Save Button ── */}
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 transition-all duration-300",
            isDirty ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
          )}
        >
          <button
            type="submit"
            disabled={isPending || !isDirty}
            className="flex items-center gap-3 h-12 px-6 rounded-2xl
              bg-foreground text-background
              text-[11px] font-black uppercase tracking-widest
              shadow-2xl shadow-black/40
              hover:scale-105 active:scale-95
              disabled:opacity-60
              transition-all duration-200"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3",
            "px-5 py-3 rounded-2xl glass-strong shadow-xl text-sm font-semibold",
            "animate-in slide-in-from-bottom-4 duration-300",
            toast.type === "success" ? "text-emerald-400" : "text-rose-400"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}
    </>
  )
}
