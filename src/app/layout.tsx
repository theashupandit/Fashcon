import type { Metadata, Viewport } from "next";
import { Inter, Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from "@/components/ThemeProvider";

import ThemeToaster from "@/components/ThemeToaster";
import StorefrontTracker from "@/components/StorefrontTracker";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { getPublicCategories, getNavbarSuggestions } from "@/app/actions/storefront";
import { buildSearchSuggestions } from "@/lib/public-content";
import { getStorefrontSiteSettings, getSiteContent } from "@/app/actions/site-content";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

const inter = Inter({ subsets: ["latin"] });

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Fashcon - Iconic fashion | Aesthetic Outfits & Jewelry",
  description: "Shop Fashcon - Your source for Iconic fashion. Discover aesthetic outfits, Korean style clothing, jewelry, and trendy fashion essentials curated for the modern style.",
  keywords: [
    "Iconic fashion",
    "Fashcon",
    "aesthetic outfits",
    "korean style clothing india",
    "trendy fashion for girls",
    "jewelry",
    "fashion accessories",
    "online fashion boutique india"
  ],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/favicon.png" },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    other: {
      'p:domain_verify': 'af6af0b2d1da18e3b88360047037accb',
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.fashcon.store/",
    title: "Fashcon - Iconic fashion & Aesthetic Style",
    description: "Discover Iconic fashion, aesthetic outfits, luxury jewelry, and modern trendy styles at Fashcon.",
    images: [
      {
        url: "https://www.fashcon.store/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Fashcon - Iconic fashion & Aesthetic Style",
      },
    ],
    siteName: "Fashcon",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fashcon - Iconic fashion & Aesthetic Style",
    description: "Your destination for Iconic fashion, aesthetic outfits, and trendy accessories.",
    images: ["https://www.fashcon.store/og-banner.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categoriesResult, blogCategoriesResult, siteSettingsResult, siteContentResult, suggestionsResult] = await Promise.allSettled([
    getPublicCategories('product'),
    getPublicCategories('blog'),
    getStorefrontSiteSettings(),
    getSiteContent(),
    getNavbarSuggestions(),
  ]);

  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const blogCategories = blogCategoriesResult.status === 'fulfilled' ? blogCategoriesResult.value : [];
  const siteSettings = siteSettingsResult.status === 'fulfilled' ? siteSettingsResult.value : null;
  const siteContent = siteContentResult.status === 'fulfilled' ? siteContentResult.value : null;
  const suggestions = suggestionsResult.status === 'fulfilled' ? suggestionsResult.value : [];
  const isMaintenance = siteSettings?.maintenanceMode ?? false;
  const announcement = siteContent?.content?.announcement || null;

  if (isMaintenance) {
    return (
      <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable, playfair.variable)}>
        <body className={cn(inter.className, "overflow-x-hidden w-full bg-neutral-950 text-white")} suppressHydrationWarning>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Fashcon",
                "url": "https://www.fashcon.store",
                "logo": "https://www.fashcon.store/favicon.png"
              })
            }}
          />
          <ThemeProvider>
            <div className="premium-grid" />
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
              {/* Ambient luxury light sources */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
              
              <div className="w-full max-w-lg p-8 sm:p-12 rounded-3xl bg-neutral-900/60 border border-white/5 backdrop-blur-2xl text-center space-y-8 relative z-10 shadow-2xl">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/80 bg-rose-500/5 border border-rose-500/10 px-3 py-1.5 rounded-full inline-block">
                    System Offline
                  </span>
                  <h1 className="font-serif text-4xl sm:text-5xl font-black tracking-tight text-white mt-4">
                    FASHCON
                  </h1>
                  <div className="w-12 h-[1px] bg-white/20 mx-auto my-6" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/90">
                    Undergoing Maintenance
                  </h2>
                </div>
                
                <p className="text-sm font-medium text-white/50 leading-relaxed max-w-md mx-auto">
                  We are currently upgrading our platform systems to elevate your luxury shopping and fashion curation experience. Access to the storefront is temporarily restricted.
                </p>
                
                <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-white/30">
                  <span>EST. 2026</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>Control Vault Active</span>
                </div>
              </div>
            </div>
            <ThemeToaster />
          </ThemeProvider>
          {/* Pinterest Tag */}
          <Script id="pinterest-tag-maintenance" strategy="afterInteractive">
            {`
              !function(e){if(!window.pintrk){window.pintrk = function () {
              window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
                n=window.pintrk;n.queue=[],n.version="3.0";var
                t=document.createElement("script");t.async=!0,t.src=e;var
                r=document.getElementsByTagName("script")[0];
                r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
              
              var extId = null;
              try {
                extId = localStorage.getItem('fashcon_p_ext_id');
                if (!extId) {
                  extId = 'anon_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                  localStorage.setItem('fashcon_p_ext_id', extId);
                }
              } catch (err) {}

              if (extId) {
                pintrk('load', '2613093918707', { external_id: extId });
              } else {
                pintrk('load', '2613093918707');
              }
              pintrk('page');
            `}
          </Script>
          <noscript>
            <img height="1" width="1" style={{ display: 'none' }} alt=""
              src="https://ct.pinterest.com/v3/?event=init&tid=2613093918707&noscript=1" />
          </noscript>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable, playfair.variable)}>
      <body className={cn(inter.className, "overflow-x-hidden w-full")} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Fashcon",
              "url": "https://www.fashcon.store",
              "logo": "https://www.fashcon.store/favicon.png"
            })
          }}
        />
        <ThemeProvider>
          <StorefrontTracker />
          <ScrollToTop />
          <div className="premium-grid">
            <div className="premium-grid-glows" />
          </div>
          <AnnouncementBar announcement={announcement} />
          <Navbar categories={categories} blogCategories={blogCategories} suggestions={suggestions} />
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
          <Footer />
          <ThemeToaster />
        </ThemeProvider>
        {/* Pinterest Tag */}
        <Script id="pinterest-tag" strategy="afterInteractive">
          {`
            !function(e){if(!window.pintrk){window.pintrk = function () {
            window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
              n=window.pintrk;n.queue=[],n.version="3.0";var
              t=document.createElement("script");t.async=!0,t.src=e;var
              r=document.getElementsByTagName("script")[0];
              r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
            
            var extId = null;
            try {
              extId = localStorage.getItem('fashcon_p_ext_id');
              if (!extId) {
                extId = 'anon_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                localStorage.setItem('fashcon_p_ext_id', extId);
              }
            } catch (err) {}

            if (extId) {
              pintrk('load', '2613093918707', { external_id: extId });
            } else {
              pintrk('load', '2613093918707');
            }
            pintrk('page');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} alt=""
            src="https://ct.pinterest.com/v3/?event=init&tid=2613093918707&noscript=1" />
        </noscript>
      </body>
    </html>
  );
}
