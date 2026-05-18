import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use | Fashcon',
  description:
    'Terms and conditions governing the use of the Fashcon platform. Please read these terms carefully before accessing our services.',
};

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen pt-32 pb-24 selection:bg-primary/10">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Simple Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-4">
            Terms of <span className="text-primary">Use</span>
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-60">
            Last Updated: May 2026
          </p>
        </div>

        {/* Paragraph Content */}
        <div className="space-y-12 text-muted-foreground/90 font-medium leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Fashcon.store (the "Site"), you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
            <p>
              The materials contained in this website are protected by applicable copyright and trademark law. We reserve the right to update or change these Terms of Use at any time without notice. Your continued use of the Site following the posting of any changes constitutes acceptance of those changes.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Fashcon's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
            <p>
              Under this license you may not: modify or copy the materials; use the materials for any commercial purpose; attempt to decompile or reverse engineer any software; or remove any copyright or other proprietary notations. This license shall automatically terminate if you violate any of these restrictions and may be terminated by Fashcon at any time.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">3. Disclaimer & Accuracy</h2>
            <p>
              The materials on Fashcon's website are provided on an 'as is' basis. Fashcon makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.
            </p>
            <p>
              Further, Fashcon does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site. The materials appearing on Fashcon's website could include technical, typographical, or photographic errors.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">4. Limitations of Liability</h2>
            <p>
              In no event shall Fashcon or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Fashcon's website.
            </p>
            <p>
              Even if Fashcon or a Fashcon authorized representative has been notified orally or in writing of the possibility of such damage, these limitations apply. Because some jurisdictions do not allow limitations on implied warranties, these limitations may not apply to you.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">5. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </div>
        </div>

        {/* Simple Footer Nav */}
        <div className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Privacy</Link>
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
