import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Fashcon',
  description:
    'Learn how Fashcon collects, uses, and protects your information. Our commitment to your data privacy and transparency.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 selection:bg-primary/10">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Simple Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-4">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-60">
            Last Updated: July 2026
          </p>
        </div>

        {/* Paragraph Content */}
        <div className="space-y-12 text-muted-foreground/90 font-medium leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">1. Information We Collect</h2>
            <p>
              We do not require users to create an account or provide personal information to browse our website. However, we may automatically collect certain information when you visit, including device info, IP address, and interaction data (clicks, scrolls, engagement).
            </p>
            <p>
              This data is collected through cookies and analytics tools to help us improve our platform. We prioritize your anonymity and do not link this data to individual identities.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">2. How We Use Your Data</h2>
            <p>
              We use collected data to improve website performance, understand user behavior, and optimize our layout and content. We do not sell or directly trade your personal data with third parties for their own marketing purposes.
            </p>
            <p>
              The data collected helps us tailor our fashion curations to better serve our audience's preferences and interests.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">3. Cookies & Tracking</h2>
            <p>
              Fashcon uses cookies and tracking pixels (such as the Pinterest Tag) to enhance your style curation experience. Cookies help us analyze traffic, remember preferences, and verify outbound referrals. In compliance with GDPR and Google Consent Mode v2, you can adjust your cookie settings at any time.
            </p>
            <p>
              For a full description of cookies in use and granular controls, please see our dedicated <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">4. Third-Party Services</h2>
            <p>
              We integrate third-party tools that analyze visitor data (Google Tag Manager, Google Analytics, and Pinterest). These providers operate under their own privacy frameworks.
            </p>
            <p>
              When you click on product curation links to purchase items on <strong>Amazon</strong> or <strong>Alibaba</strong>, you are redirected to their platforms. These third-party sites deploy their own tracking systems to credit referrals. Fashcon is a participant in the Amazon Services LLC Associates Program and similar affiliate networks, earning advertising fees for refer-and-buy conversions.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">5. Data Security</h2>
            <p>
              We take reasonable measures to protect your data. However, no method of transmission over the internet is 100% secure. By using this website, you acknowledge that you provide and access information at your own risk.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">6. Your Rights</h2>
            <p>
              Depending on your location, you may have rights regarding your data, including the right to access, request deletion, or restrict processing. Since we collect minimal personal data, we will cooperate with all reasonable requests related to your information.
            </p>
          </div>
        </div>

        {/* Simple Footer Nav */}
        <div className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <Link href="/terms-of-use" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Terms</Link>
            <Link href="/cookie-policy" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Cookies</Link>
            <Link href="/return-policy" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Return Policy</Link>
            <Link href="/disclaimer" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Disclaimer</Link>
            <Link href="/affiliate-disclosure" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Affiliate Disclosure</Link>
          </div>
          <Link
            href="/"
            className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
          >
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
