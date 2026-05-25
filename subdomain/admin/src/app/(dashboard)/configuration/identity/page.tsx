'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';
import { getSiteSettings } from '@/app/actions/siteSettings';
import SiteSettingsForm from '@/components/configuration/SiteConfigurationForm';

export default function SiteIdentityPage() {
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    getSiteSettings().then(setSiteSettings);
  }, []);

  if (!siteSettings) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <PageHeader
        title="Site Identity"
        subtitle="Manage your brand identity, global SEO metadata, and primary assets."
        badge="Identity"
      />

      <div className="bg-[#0B0B0C] border border-white/10 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
             <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Brand Intelligence</h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Core Platform Metadata</p>
          </div>
        </div>
        <SiteSettingsForm defaultValues={siteSettings} />
      </div>
    </div>
  );
}
