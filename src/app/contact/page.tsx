'use client';

import React, { useState } from 'react';
import { Mail, MapPin, MessageSquare, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { sendContactMessage } from '@/app/actions/storefront';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;
    if (!name || !email || !subject || !message) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendContactMessage({ name, email, subject, message });
      if (res.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success(res.message || 'Message sent successfully!');
      } else {
        toast.error(res.error || 'Failed to send message.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="text-[var(--foreground)] py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors font-sans">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/40 bg-clip-text text-transparent mb-4">
          GET IN TOUCH
        </h1>
        <div className="w-16 sm:w-20 h-1.5 bg-[var(--primary)] mx-auto rounded-full mb-8" />
        <p className="text-sm sm:text-base opacity-70 max-w-2xl mx-auto font-medium">
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
          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 gap-4 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="text-emerald-500 w-16 h-16 animate-bounce" />
              <h2 className="text-2xl font-bold">Thank You!</h2>
              <p className="opacity-70 text-sm max-w-sm">
                Your message has been safely delivered. Our team will review your inquiry and get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-6 py-2.5 rounded-pinterest bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-sm transition-all hover:opacity-90"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-pinterest border border-[var(--input-border)] outline-none transition-all font-medium bg-[var(--input-bg)] text-[var(--foreground)] disabled:opacity-50"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-pinterest border border-[var(--input-border)] outline-none transition-all font-medium bg-[var(--input-bg)] text-[var(--foreground)] disabled:opacity-50"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-pinterest border border-[var(--input-border)] outline-none transition-all font-medium bg-[var(--input-bg)] text-[var(--foreground)] disabled:opacity-50"
                  placeholder="Inquiry subject"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows={5}
                  className="w-full px-4 py-3 rounded-pinterest border border-[var(--input-border)] outline-none transition-all font-medium resize-none bg-[var(--input-bg)] text-[var(--foreground)] disabled:opacity-50"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-4 rounded-pinterest font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-98 disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    Sending Message <Loader2 className="animate-spin" size={18} />
                  </>
                ) : (
                  <>
                    Send Message <Send size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
