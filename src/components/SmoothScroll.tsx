'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode, useEffect, useState } from 'react';
import { useScrollStore } from '@/lib/store';

interface SmoothScrollProps {
  children: ReactNode;
}

/**
 * SmoothScroll Provider using Lenis.
 * This adds the "premium 90Hz" inertial scroll feel.
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const { isSmoothScrollEnabled } = useScrollStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        // Customizing for a "premium but snappy" feel
        lerp: 0.1,           // Smoothing factor (0 to 1). Lower is smoother.
        duration: 1.5,       // Duration of the scroll animation.
        smoothWheel: isSmoothScrollEnabled,   // Enable smooth scrolling for mouse wheel.
        wheelMultiplier: 1.1, // Adjust scroll speed.
        touchMultiplier: 2,   // Sensitivity for touch devices.
        infinite: false,     // Disable infinite scroll.
      }}
    >
      {children}
    </ReactLenis>
  );
}
