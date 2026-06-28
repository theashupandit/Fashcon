'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode, useEffect, useState } from 'react';
import { useScrollStore } from '@/lib/store';

interface SmoothScrollProps {
  children: ReactNode;
}

/**
 * SmoothScroll Provider using Lenis.
 * Bypasses scrolling override on mobile & touch devices to leverage native hardware-accelerated momentum scrolling.
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const { isSmoothScrollEnabled } = useScrollStore();
  const [mounted, setMounted] = useState(false);
  const [isMobileOrTouch, setIsMobileOrTouch] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Detect mobile viewport or touch support
    const checkDevice = () => {
      const touchSupport =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      const isSmallScreen = window.innerWidth < 768;

      setIsMobileOrTouch(touchSupport || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!mounted) return <>{children}</>;

  // Completely bypass Lenis on mobile/touch to use native hardware-accelerated momentum scrolling
  if (isMobileOrTouch) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.12,                          // Snappier response (was 0.1)
        smoothWheel: isSmoothScrollEnabled,  // Controlled by Admin Topbar setting
        wheelMultiplier: 1.0,                // Standardize scroll distance multiplier
        syncTouch: false,                    // Avoid touch conflicts on touchpads/touchscreen PCs
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
