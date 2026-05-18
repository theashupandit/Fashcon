import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Disclaimer | Fashcon',
  description:
    'Legal disclaimer governing the use of the Fashcon website. Please read these terms carefully before using our platform.',
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 selection:bg-primary/10">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Simple Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-4">
            Legal <span className="text-primary">Disclaimer</span>
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-60">
            Professional & Content Disclosure
          </p>
        </div>

        {/* Paragraph Content */}
        <div className="space-y-12 text-muted-foreground/90 font-medium leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">1. General Information</h2>
            <p>
              Please read the following disclaimer carefully before using this website. This disclaimer governs your use of Fashcon.store site. By using this website, you accept this disclaimer in full. If you disagree with any part of this disclaimer, do not use Fashcon or any affiliated websites.
            </p>
            <p>
              All information and resources found on Fashcon are based on the opinions of the author unless otherwise noted. All information is intended to provide style inspiration and lifestyle guidance for our readers.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">2. Professional Advice Disclaimer</h2>
            <p>
              The information on this website is provided for informational and inspirational purposes only and is not intended to be a substitute for professional advice. Always seek the advice of a qualified professional with any questions you may have regarding a specific subject matter.
            </p>
            <p>
              Reliance on any information provided by Fashcon, its authors, or others appearing on the site at the invitation of Fashcon is solely at your own risk. Fashcon is not responsible for any adverse effects or consequences resulting from the use of any suggestions, products, or procedures described on this site.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">3. Accuracy of Information</h2>
            <p>
              While we strive to keep the information on this website up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.
            </p>
            <p>
              Any reliance you place on such information is therefore strictly at your own risk. We reserve the right to modify the contents of this site at any time, but we have no obligation to update any information on our site.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">4. External Links Disclaimer</h2>
            <p>
              Through this website you are able to link to other websites which are not under the control of Fashcon. We have no control over the nature, content and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.
            </p>
          </div>
        </div>

        {/* Simple Footer Nav */}
        <div className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <Link href="/terms-of-use" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy-policy" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Privacy</Link>
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
