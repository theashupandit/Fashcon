"use server"

import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/mongodb"
import SiteSettings, { ISiteSettings } from "@/lib/models/SiteSettings"
import { requireAdmin, logAdminAction } from "@/lib/server-auth"

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
    const session = await requireAdmin();
    await dbConnect()

    // Security-sensitive fields that only Super Admin can change
    const securityFields = ['loginRequired', 'maintenanceMode', 'headScripts', 'bodyScripts', 'googleAnalyticsId', 'googleSearchConsoleTag', 'pinterestVerificationTag', 'inspectProtection', 'allowSuperAdminInspect'];
    
    const attemptedSecurityChanges = Object.keys(data).filter(key => securityFields.includes(key));
    
    if (attemptedSecurityChanges.length > 0 && session.role !== 'super_admin') {
      return { 
        success: false, 
        message: `Unauthorized: Only Super Admin can modify security-sensitive settings (${attemptedSecurityChanges.join(', ')}).` 
      };
    }

    await SiteSettings.findOneAndUpdate({}, { $set: data }, { upsert: true, new: true })
    
    await logAdminAction('Update Site Settings', `Updated fields: ${Object.keys(data).join(', ')}`);
    
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
