'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logVisitorEvent } from '@/app/actions/visitor';

function TrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let extId = null;
    try {
      extId = localStorage.getItem('fashcon_p_ext_id');
      if (!extId) {
        extId = 'anon_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('fashcon_p_ext_id', extId);
      }
    } catch (err) {}

    if (extId) {
      const details = {
        pathname,
        search: searchParams.toString(),
        referrer: document.referrer || '',
      };

      logVisitorEvent({
        externalId: extId,
        event: 'pageview',
        details: JSON.stringify(details),
      }).catch((err) => console.error('Failed to log page visit to DB:', err));
    }
  }, [pathname, searchParams]);

  return null;
}

export default function StorefrontTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
