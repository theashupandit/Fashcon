'use client';

import { useTheme } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';

export function ThemeToaster() {
  const { theme } = useTheme();

  return (
    <Toaster 
      theme={theme as 'light' | 'dark'} 
      position="bottom-right"
      richColors
      closeButton
    />
  );
}
