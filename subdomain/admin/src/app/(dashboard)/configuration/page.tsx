'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ConfigurationLanding() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the first meaningful pill page
    router.replace('/configuration/identity');
  }, [router]);

  return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Initializing Configuration Hub...</p>
    </div>
  );
}
