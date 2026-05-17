'use client';

import { Mail, MapPin, MessageSquare, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors font-sans">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent mb-4">
          GET IN TOUCH
        </h1>
        <div className="w-24 h-1.5 bg-[var(--primary)] mx-auto rounded-full mb-10" />
        <p className="text-lg opacity-70 max-w-2xl mx-auto font-medium">
          Have a question about a product? Want to collaborate? Or just want to say hi? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-20">
        <div>
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--card)] rounded-full text-[var(--primary)] border border-[var(--border)]">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold">Email Us</h3>
                <p className="opacity-70">business@fashcon.store</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--card)] rounded-full text-[var(--primary)] border border-[var(--border)]">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="font-bold">Support</h3>
                <p className="opacity-70">We reply within 24 hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[var(--card)] rounded-full text-[var(--primary)] border border-[var(--border)]">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold">Location</h3>
                <p className="opacity-70">Mumbai, India</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] p-10 rounded-pinterest-lg border border-[var(--border)]">
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-pinterest border border-[var(--input-border)] outline-none transition-all font-medium bg-[var(--input-bg)] text-[var(--foreground)]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-pinterest border border-[var(--input-border)] outline-none transition-all font-medium bg-[var(--input-bg)] text-[var(--foreground)]"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Subject</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-pinterest border border-[var(--input-border)] outline-none transition-all font-medium bg-[var(--input-bg)] text-[var(--foreground)]"
                placeholder="Inquiry subject"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Message</label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 rounded-pinterest border border-[var(--input-border)] outline-none transition-all font-medium resize-none bg-[var(--input-bg)] text-[var(--foreground)]"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="button"
              className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-4 rounded-pinterest font-bold flex items-center justify-center gap-2 transition-all"
            >
              Send Message <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
