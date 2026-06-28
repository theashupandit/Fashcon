'use client';

import { useState, useEffect } from 'react';
import { Shield, Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fashcon_cookie_consent');
      setConsent(stored || 'undecided');
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('fashcon_cookie_consent', 'accepted');
    setConsent('accepted');
    // Dispatch a custom event to notify trackers that consent was given
    window.dispatchEvent(new Event('fashcon_consent_accepted'));
  };

  const handleReject = () => {
    localStorage.setItem('fashcon_cookie_consent', 'rejected');
    setConsent('rejected');
  };

  if (consent !== 'undecided') return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-black/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white">
        <div className="flex items-start gap-4">
          <div className="bg-white/10 p-3 rounded-2xl text-[var(--primary)] shrink-0">
            <Cookie size={24} className="text-rose-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-white/90">
              <Shield size={12} className="text-emerald-400" />
              Cookie & Privacy Consent
            </h4>
            <p className="text-[11px] leading-relaxed text-white/50">
              We use premium analytics & personalization cookies to measure audience insights and optimize your luxury browsing experience.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full border-t border-white/5 pt-4 mt-1">
          <button
            onClick={handleReject}
            className="flex-1 h-9 rounded-xl border border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all text-white/40 hover:text-white"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 h-9 rounded-xl bg-white hover:bg-white/95 text-black text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
