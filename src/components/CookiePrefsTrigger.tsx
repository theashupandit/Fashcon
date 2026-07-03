'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function CookiePrefsTrigger() {
  const handleOpen = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('fashcon_open_cookie_preferences'));
    }
  };

  return (
    <button
      onClick={handleOpen}
      className="inline-flex items-center gap-2.5 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-[11px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 cursor-pointer"
    >
      <ShieldAlert size={14} />
      <span>Update Consent Preferences</span>
    </button>
  );
}
