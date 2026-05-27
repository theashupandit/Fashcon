'use client';

import { useCallback, useRef } from "react";
import { usePathname } from 'next/navigation';
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

/**
 * View Transitions API Types (Polyfill check)
 */
declare global {
  interface Document {
    startViewTransition(callback: () => void): {
      ready: Promise<void>;
      finished: Promise<void>;
      updateCallbackDone: Promise<void>;
    };
  }
}

type AnimationType = "circle-spread";

interface ToggleThemeProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
  animationType?: AnimationType;
}

export const ToggleTheme = ({
  className,
  duration = 500,
  animationType = "circle-spread",
  ...props
}: ToggleThemeProps) => {
  const { theme, toggleTheme: baseToggleTheme } = useTheme();
  const isDark = theme === "dark";
  const buttonRef = useRef<HTMLButtonElement>(null);

  const pathname = usePathname();
  const isHome = pathname === '/';

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    // Fast switch for Home page or if View Transitions API is not supported
    if (isHome || !document.startViewTransition) {
      baseToggleTheme();
      return;
    }

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    await document.startViewTransition(() => {
      flushSync(() => {
        baseToggleTheme();
      });
    }).ready;

    switch (animationType) {
      case "circle-spread":
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        );
        break;
    }
  }, [baseToggleTheme, animationType, duration]);

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        'group flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ease-out border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/5 hover:border-[var(--foreground)]/10 hover:-translate-y-0.5 shadow-sm',
        className
      )}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      {...props}
    >
      <span className="sr-only">Toggle Theme</span>
      {isDark ? (
        <i className="fa-solid fa-sun text-[18px] bg-gradient-to-tr from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent animate-pulse" style={{ filter: 'drop-shadow(0 0 5px rgba(251, 191, 36, 0.5))' }}></i>
      ) : (
        <i className="fa-solid fa-moon text-[18px] bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 5px rgba(129, 140, 248, 0.5))' }}></i>
      )}
    </button>
  );
};
