import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Return Policy | Fashcon',
  description:
    'Fashcon Return Policy. Understand how returns, refunds, and exchanges work for products curated from Amazon and Alibaba.',
};

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 selection:bg-primary/10">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Simple Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-4">
            Return <span className="text-primary">Policy</span>
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-60">
            Last Updated: July 2026
          </p>
        </div>

        {/* Paragraph Content */}
        <div className="space-y-12 text-muted-foreground/90 font-medium leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">1. Curated Storefront Disclosure</h2>
            <p>
              Fashcon is a luxury curated fashion catalog and digital lookbook. We curate, index, and review style selections, connecting you to exceptional fashion options.
            </p>
            <p>
              <strong>Please Note:</strong> Fashcon does not directly sell, stock, package, or ship any products listed on the platform. All checkouts and payments occur directly on our partner merchant platforms, primarily <strong>Amazon</strong> and <strong>Alibaba</strong>.
            </p>
            <p>
              Consequently, Fashcon does not issue refunds, process exchanges, or manage return shipments. All returns are subject to the specific terms and policies of the seller or platform where the final transaction was completed.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">2. Amazon Purchases Return Policy</h2>
            <p>
              If your product was purchased via an Amazon affiliate link, your order is protected under Amazon's return policies:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <strong>30-Day Window:</strong> Most fashion apparel, shoes, jewelry, and accessories purchased on Amazon are eligible for return within 30 days of receipt of shipment.
              </li>
              <li>
                <strong>Free Returns:</strong> Look for the "Free Returns" badge on the Amazon product details page. If listed, you do not pay return shipping.
              </li>
              <li>
                <strong>Initiating a Return:</strong> Navigate to your Amazon account's <strong>"Your Orders"</strong> section, select the item you purchased, click <strong>"Return or Replace Items,"</strong> select a reason, and print the pre-paid shipping label.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">3. Alibaba Purchases Return Policy</h2>
            <p>
              If your product was purchased via an Alibaba link, the policy depends on the individual manufacturer or supplier terms and is protected under Alibaba's Trade Assurance:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <strong>Supplier-Specific Policies:</strong> Alibaba is a wholesale marketplace connecting businesses with suppliers. Return windows, restocking fees, and shipping terms are set by individual suppliers in the initial purchase agreement.
              </li>
              <li>
                <strong>Trade Assurance Protection:</strong> If the supplier fails to ship on time or the product quality deviates from the contract, you can open a dispute via Alibaba's <strong>Trade Assurance</strong> program to claim a refund within the specified protection window (typically 30 days from customs clearance).
              </li>
              <li>
                <strong>Initiating a Return/Dispute:</strong> Log in to Alibaba, navigate to <strong>"My Orders,"</strong> locate the order transaction, and click <strong>"Apply for Refund"</strong> or contact the vendor directly via the built-in Trade Manager chat.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">4. Resolving Order Issues</h2>
            <p>
              If you experience problems with shipment tracking, delivery delays, incorrect sizes, or billing, you must contact the merchant platform directly (Amazon or Alibaba Customer Support) as Fashcon does not have access to customer transaction databases or order histories.
            </p>
            <p>
              For general questions regarding styling collections or product link corrections, feel free to email our team at{' '}
              <Link href="mailto:officialfashcon@gmail.com" className="text-primary hover:underline font-bold">
                officialfashcon@gmail.com
              </Link>{' '}
              (or alternative:{' '}
              <Link href="mailto:business@fashcon.store" className="text-primary hover:underline font-bold">
                business@fashcon.store
              </Link>).
            </p>
          </div>
        </div>

        {/* Simple Footer Nav */}
        <div className="mt-20 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Privacy</Link>
            <Link href="/cookie-policy" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Cookies</Link>
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
