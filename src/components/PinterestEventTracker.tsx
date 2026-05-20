'use client';

import { useEffect } from 'react';

type PinterestEvent = 'pagevisit' | 'viewcategory' | 'search' | 'lead' | 'addtocart' | 'signup' | 'checkout';

interface PinterestEventTrackerProps {
  event: PinterestEvent;
  data?: Record<string, any>;
}

export default function PinterestEventTracker({ event, data }: PinterestEventTrackerProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).pintrk) {
      (window as any).pintrk('track', event, data);
    }
  }, [event, JSON.stringify(data)]);
  
  return null;
}
