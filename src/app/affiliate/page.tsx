import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | Fashcon',
  description:
    'Transparency notice regarding our affiliate relationships. Learn how we support our editorial curation through affiliate commissions.',
};

export default function AffiliatePage() {
  return (
    <main className="min-h-screen pt-32 pb-24 bg-background selection:bg-primary/10">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Simple Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-4">
            Affiliate <span className="text-primary">Disclosure</span>
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-60">
            Transparency in our Curation
          </p>
        </div>

        {/* Paragraph Content */}
        <div className="space-y-12 text-muted-foreground/90 font-medium leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">How we support Fashcon</h2>
            <p>
              At Fashcon, our goal is to provide you with the most exquisite fashion curations and style inspiration. To keep our platform running and maintain our high editorial standards, we participate in various affiliate marketing programs.
            </p>
            <p>
              This means that when you click on certain product links on our site and make a purchase, we may receive a small commission from the retailer. This comes at **no additional cost to you**.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Editorial Integrity</h2>
            <p>
              Our editorial independence is our most valuable asset. We only recommend products that we genuinely believe in and that align with the luxury aesthetic of Fashcon. Our curators are not influenced by the affiliate commission rates; their primary focus is always on style, quality, and relevance to our readers.
            </p>
            <p>
              We prioritize your experience over everything else. The inclusion of an affiliate link does not influence our evaluation of a product. We will always be transparent about our relationships with brands and retailers.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Amazon Associate Disclosure</h2>
            <p>
              Fashcon is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in or Amazon.com.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Questions?</h2>
            <p>
              If you have any questions about our affiliate relationships or how we earn revenue, please feel free to reach out to us at <Link href="mailto:business@fashcon.store" className="text-primary hover:underline">business@fashcon.store</Link>.
            </p>
          </div>
        </div>

        {/* Simple Footer Nav */}
        <div className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <Link href="/terms-of-use" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy-policy" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Privacy</Link>
            <Link href="/disclaimer" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Disclaimer</Link>
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
