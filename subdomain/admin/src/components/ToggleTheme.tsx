'use client';

import { useCallback, useRef } from "react";
import { Moon, Sun } from "lucide-react";
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

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    // Fallback: if View Transitions API is not supported, toggle without animation
    if (!document.startViewTransition) {
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
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex items-center justify-center transition-colors duration-200",
        className
      )}
      {...props}
    >
      {/* Sun icon — visible in dark mode (click to go light) */}
      <Sun
        className={cn(
          "absolute w-4 h-4 transition-all duration-300",
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-50"
        )}
      />
      {/* Moon icon — visible in light mode (click to go dark) */}
      <Moon
        className={cn(
          "absolute w-4 h-4 transition-all duration-300",
          !isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-50"
        )}
      />
    </button>
  );
};
