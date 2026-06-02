'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScrollStore {
  isSmoothScrollEnabled: boolean;
  toggleSmoothScroll: () => void;
  setSmoothScroll: (enabled: boolean) => void;
}

export const useScrollStore = create<ScrollStore>()(
  persist(
    (set) => ({
      isSmoothScrollEnabled: true,
      toggleSmoothScroll: () => set((state) => ({ isSmoothScrollEnabled: !state.isSmoothScrollEnabled })),
      setSmoothScroll: (enabled: boolean) => set({ isSmoothScrollEnabled: enabled }),
    }),
    {
      name: 'fashcon-scroll-settings',
    }
  )
);
