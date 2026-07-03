import type { Metadata } from 'next';
import Link from 'next/link';
import CookiePrefsTrigger from '@/components/CookiePrefsTrigger';

export const metadata: Metadata = {
  title: 'Cookie Policy | Fashcon',
  description:
    'Learn how Fashcon uses cookies and similar tracking technologies to enhance your style exploration experience.',
};

export default function CookiePolicyPage() {
  const cookieDetails = [
    {
      name: 'fashcon_cookie_consent',
      category: 'Essential',
      purpose: 'Stores your GDPR cookie consent preferences (accepted, rejected, or session configurations).',
      duration: '1 Year',
    },
    {
      name: 'fashcon_cookie_preferences',
      category: 'Essential',
      purpose: 'Stores granular settings for Analytics, Personalization, and Marketing permissions.',
      duration: '1 Year',
    },
    {
      name: '_ga, _ga_*',
      category: 'Analytics',
      purpose: 'Used by Google Analytics to collect anonymous metrics on page views, visitor sessions, and site usage.',
      duration: '2 Years',
    },
    {
      name: '_pinterest_ct_ua',
      category: 'Marketing',
      purpose: 'Pinterest conversion pixel cookie used to measure referral clicks, outbound engagement, and target advertising campaigns.',
      duration: '1 Year',
    },
    {
      name: 'ref, tag, affiliate_id',
      category: 'Affiliate tracking',
      purpose: 'Placed by third-party merchants (Amazon, Alibaba) when redirecting from Fashcon to verify referral traffic for commissions.',
      duration: 'Session to 30 Days',
    },
  ];

  return (
    <main className="min-h-screen pt-32 pb-24 selection:bg-primary/10">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Simple Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-4">
            Cookie <span className="text-primary">Policy</span>
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-60">
            Last Updated: July 2026
          </p>
        </div>

        {/* Paragraph Content */}
        <div className="space-y-12 text-muted-foreground/90 font-medium leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your computer or mobile device when you visit websites. They help websites recognize your device, remember settings, and aggregate browsing statistics to deliver custom features and insights.
            </p>
            <p>
              By using Fashcon, you consent to the use of cookies in accordance with this policy. You can control which categories of cookies you permit at any time.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">2. How We Use Cookies</h2>
            <p>
              Fashcon uses cookies to optimize styling recommendation flows, track outbound affiliate traffic referrals, measure site metrics via analytics, and integrate Pinterest tracking events.
            </p>
            <p>
              Crucially, because Fashcon is a curated catalog listing products from merchants like <strong>Amazon</strong> and <strong>Alibaba</strong>, clicking on product links redirects you to third-party marketplaces. These platforms place their own tracking cookies to properly attribute referral traffic and facilitate purchases.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">3. Cookies In Use</h2>
            <div className="overflow-x-auto border border-border rounded-2xl bg-card">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50 font-bold uppercase tracking-wider text-foreground">
                    <th className="p-4">Cookie / Identifier</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Purpose</th>
                    <th className="p-4">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {cookieDetails.map((cookie, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">{cookie.name}</td>
                      <td className="p-4 uppercase tracking-widest text-[9px] font-black">{cookie.category}</td>
                      <td className="p-4 text-muted-foreground leading-normal">{cookie.purpose}</td>
                      <td className="p-4">{cookie.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">4. Managing Your Preferences</h2>
            <p>
              You can review or adjust your consent choices at any time. Clicking the button below opens the Privacy Center banner where you can enable or disable Analytics, Personalization, and Marketing cookies dynamically.
            </p>
            <div className="pt-4">
              <CookiePrefsTrigger />
            </div>
            <p className="text-xs italic opacity-70 mt-2">
              Note: Restricting cookies may affect your browsing experience, such as resetting theme options or failing to retain wishlist choices.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">5. Third-Party Websites</h2>
            <p>
              Please note that third-party merchants (Amazon, Alibaba) operate under their own privacy policies. Fashcon has no access to or control over cookies that may be used by these third-party websites during your checkout. We recommend reading the cookie policies of these platforms upon redirection.
            </p>
          </div>
        </div>

        {/* Simple Footer Nav */}
        <div className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms-of-use" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Terms</Link>
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
