'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

export default function CookieConsent() {
  const [consent, setConsent] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fashcon_cookie_consent');
      setConsent(stored ? 'accepted' : 'undecided');
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences = {
      essential: true,
      analytics: true,
      personalization: true,
      marketing: true
    };
    localStorage.setItem('fashcon_cookie_preferences', JSON.stringify(preferences));
    localStorage.setItem('fashcon_cookie_consent', 'accepted');
    setConsent('accepted');
    window.dispatchEvent(new Event('fashcon_consent_accepted'));
  };

  const handleSaveSelections = () => {
    const preferences = {
      essential: true,
      analytics,
      personalization,
      marketing
    };
    localStorage.setItem('fashcon_cookie_preferences', JSON.stringify(preferences));
    
    const overallConsent = (analytics || personalization) ? 'accepted' : 'rejected';
    localStorage.setItem('fashcon_cookie_consent', overallConsent);
    setConsent(overallConsent);
    if (overallConsent === 'accepted') {
      window.dispatchEvent(new Event('fashcon_consent_accepted'));
    }
  };

  const handleRejectAll = () => {
    const preferences = {
      essential: true,
      analytics: false,
      personalization: false,
      marketing: false
    };
    localStorage.setItem('fashcon_cookie_preferences', JSON.stringify(preferences));
    localStorage.setItem('fashcon_cookie_consent', 'rejected');
    setConsent('rejected');
  };

  const handleNotNow = () => {
    setConsent('session_ignored');
  };

  if (consent !== 'undecided') return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-neutral-950/95 dark:bg-black/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 text-white">
        
        {/* Header Block */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-serif italic font-black tracking-widest text-[11px] text-white">
              FASHCON
            </span>
            <span className="text-[10px] font-medium text-white/20">|</span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-1.5">
              <Shield size={11} className="text-rose-400" />
              Privacy Center
            </span>
          </div>
          <button 
            onClick={handleNotNow} 
            className="text-white/40 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer"
          >
            Not Now
          </button>
        </div>

        {/* Info Block */}
        <div className="space-y-2">
          <h3 className="font-serif text-base font-bold text-white tracking-wide">
            Your Privacy Matters
          </h3>
          <p className="text-[11px] leading-relaxed text-white/50">
            We use cookies to elevate your shopping experience:
          </p>
          <div className="space-y-1.5 text-[10.5px] leading-relaxed text-white/70">
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-bold">✓</span>
              <span>Keep your account secure & encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-bold">✓</span>
              <span>Save your wishlist & size preferences</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-bold">✓</span>
              <span>Personalize product recommendations</span>
            </div>
          </div>
          <p className="text-[9px] text-white/30 italic">
            Your data is encrypted and never sold.
          </p>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-1.5 py-1">
          {/* Essential */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-wider text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Essential
          </div>

          {/* Analytics Toggle */}
          <button
            onClick={() => setAnalytics(!analytics)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              analytics
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-white/5 border-white/5 text-white/30"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${analytics ? 'bg-rose-400' : 'bg-white/10'}`} />
            Analytics: {analytics ? 'ON' : 'OFF'}
          </button>

          {/* Personalization Toggle */}
          <button
            onClick={() => setPersonalization(!personalization)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              personalization
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-white/5 border-white/5 text-white/30"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${personalization ? 'bg-rose-400' : 'bg-white/10'}`} />
            Personalization: {personalization ? 'ON' : 'OFF'}
          </button>

          {/* Marketing Toggle */}
          <button
            onClick={() => setMarketing(!marketing)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              marketing
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-white/5 border-white/5 text-white/30"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${marketing ? 'bg-rose-400' : 'bg-white/10'}`} />
            Marketing: {marketing ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col gap-2 pt-1 border-t border-white/5">
          <button
            onClick={handleAcceptAll}
            className="w-full h-9 rounded-xl bg-white hover:bg-neutral-100 text-black text-[9.5px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center relative overflow-hidden group cursor-pointer"
          >
            Enjoy the Best Experience
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-rose-500 text-white text-[7px] px-2 py-0.5 rounded-full tracking-wide font-black">
              Recommended
            </span>
          </button>
          
          <div className="flex gap-2 w-full">
            <button
              onClick={handleRejectAll}
              className="flex-1 h-8 rounded-lg border border-white/10 hover:bg-white/5 text-[8.5px] font-black uppercase tracking-wider text-white/50 hover:text-white transition-all cursor-pointer"
            >
              Essential Only
            </button>
            <button
              onClick={handleSaveSelections}
              className="flex-1 h-8 rounded-lg border border-white/10 hover:bg-white/5 text-[8.5px] font-black uppercase tracking-wider text-white/50 hover:text-white transition-all cursor-pointer"
            >
              Save Selections
            </button>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="flex items-center justify-between text-[7.5px] font-black uppercase tracking-[0.15em] text-white/20 pt-1">
          <span>🔒 Encrypted</span>
          <span>•</span>
          <span>GDPR Ready</span>
          <span>•</span>
          <span>Privacy First</span>
        </div>

      </div>
    </div>
  );
}
