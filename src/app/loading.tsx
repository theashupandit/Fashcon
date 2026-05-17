'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Editorial Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[10000] overflow-hidden">
        <div className="h-full bg-primary animate-[top-loading_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" />
      </div>

      {/* Very Subtle Center Indicator - Minimalist */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[2px] transition-opacity duration-500">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl font-black italic tracking-tighter text-primary animate-pulse select-none">
            FASHCON
          </span>
          <div className="h-[1px] w-4 bg-primary animate-[width-expand_1s_ease-in-out_infinite]" />
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes top-loading {
          0% { transform: translateX(-100%) scaleX(0.5); }
          50% { transform: translateX(0%) scaleX(0.8); }
          100% { transform: translateX(100%) scaleX(0.5); }
        }
        @keyframes width-expand {
          0%, 100% { width: 0px; opacity: 0; }
          50% { width: 24px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}


