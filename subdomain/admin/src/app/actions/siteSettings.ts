"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/mongodb"
import SiteSettings, { ISiteSettings } from "@/lib/models/SiteSettings"

// ── Fetch singleton ──────────────────────────────────────────────────────────
export async function getSiteSettings(): Promise<Partial<ISiteSettings>> {
  await dbConnect()
  // @ts-ignore — statics typing
  const doc = await SiteSettings.getSingleton()
  return JSON.parse(JSON.stringify(doc))
}

// ── Save singleton ───────────────────────────────────────────────────────────
export async function saveSiteSettings(
  data: Partial<ISiteSettings>
): Promise<{ success: boolean; message: string }> {
  try {
    await dbConnect()
    await SiteSettings.findOneAndUpdate({}, { $set: data }, { upsert: true, new: true })
    revalidatePath("/", "layout") // revalidate entire site on save
    return { success: true, message: "Settings saved successfully." }
  } catch (err: any) {
    return { success: false, message: err.message ?? "Failed to save settings." }
  }
}

// ── Clear Next.js cache ──────────────────────────────────────────────────────
export async function clearNextCache(): Promise<{ success: boolean; message: string }> {
  try {
    revalidatePath("/", "layout")
    return { success: true, message: "Cache cleared successfully." }
  } catch (err: any) {
    return { success: false, message: err.message ?? "Failed to clear cache." }
  }
}
