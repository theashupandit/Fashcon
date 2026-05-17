'use client';

import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/components/ThemeProvider';

export default function ThemeToaster() {
  const { theme } = useTheme();

  return <Toaster position="bottom-right" theme={theme} />;
}
