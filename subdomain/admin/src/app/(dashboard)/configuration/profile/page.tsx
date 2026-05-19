'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
        Redirecting to Secure Profile Vault...
      </div>
    </div>
  );
}
