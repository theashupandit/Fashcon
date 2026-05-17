'use client';

import React from 'react';
import MonetizationPanel from '@/components/admin/MonetizationPanel';
import PageHeader from '@/components/admin/PageHeader';


export default function AffiliatePage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Affiliate Hub"
        subtitle="Monetization channels and performance tracking"
        badge="Revenue"
      />

      <div className="mt-6">
        <MonetizationPanel />
      </div>
    </div>
  );
}
