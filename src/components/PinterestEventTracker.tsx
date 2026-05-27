'use client';

import { useEffect } from 'react';
import { logVisitorEvent } from '@/app/actions/visitor';

type PinterestEvent = 'pagevisit' | 'viewcategory' | 'search' | 'lead' | 'addtocart' | 'signup' | 'checkout';

interface PinterestEventTrackerProps {
  event: PinterestEvent;
  data?: Record<string, any>;
}

export default function PinterestEventTracker({ event, data }: PinterestEventTrackerProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).pintrk) {
      let extId = null;
      try {
        extId = localStorage.getItem('fashcon_p_ext_id');
        if (!extId) {
          extId = 'anon_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          localStorage.setItem('fashcon_p_ext_id', extId);
        }
      } catch (err) {}

      const trackData = { ...data };
      if (extId) {
        trackData.external_id = extId;
      }
      (window as any).pintrk('track', event, trackData);

      // Save visitor event log to MongoDB
      if (extId) {
        logVisitorEvent({
          externalId: extId,
          event: event,
          details: data ? JSON.stringify(data) : undefined,
        }).catch(err => console.error('Failed to log visitor event to DB:', err));
      }
    }
  }, [event, JSON.stringify(data)]);
  
  return null;
}
