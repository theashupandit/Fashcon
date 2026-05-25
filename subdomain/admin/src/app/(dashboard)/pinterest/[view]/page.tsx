'use client';

import React, { use } from 'react';
import PinterestEngine from '@/components/admin/PinterestEngine';

export default function PinterestViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = use(params);
  
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <PinterestEngine initialView={view} />
    </div>
  );
}
