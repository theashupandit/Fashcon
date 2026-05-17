// app/(dashboard)/configuration/site/page.tsx
import { getSiteSettings } from "@/app/actions/siteSettings"
import SiteSettingsPage from "@/components/configuration/SiteConfigurationForm"
import { SiteSettingsFormValues } from "@/lib/siteSettingsSchema"

export const dynamic = "force-dynamic"

export default async function SiteConfigurationPage() {
  const settings = await getSiteSettings()

  return (
    <div className="space-y-0 pb-24 animate-in fade-in duration-500">
      <SiteSettingsPage defaultValues={settings as Partial<SiteSettingsFormValues>} />
    </div>
  )
}
