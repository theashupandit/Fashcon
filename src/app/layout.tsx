import type { Metadata, Viewport } from "next";
import { Inter, Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

import ThemeToaster from "@/components/ThemeToaster";
import { cn } from "@/lib/utils";
import { getAllProducts, getLatestBlogs, getPublicCategories } from "@/app/actions/storefront";
import { buildSearchSuggestions } from "@/lib/public-content";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Fashcon | Designer Fashion & Premium Curations",
  description: "Explore the latest in fashion, beauty, and home decor. Pinterest-inspired curations for your lifestyle.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    other: {
      'p:domain_verify': 'af6af0b2d1da18e3b88360047037accb',
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categoriesResult, productsResult, blogsResult] = await Promise.allSettled([
    getPublicCategories('product'),
    getAllProducts(),
    getLatestBlogs(),
  ]);

  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
  const blogs = blogsResult.status === 'fulfilled' ? blogsResult.value : [];

  const suggestions = buildSearchSuggestions({
    products,
    blogs,
    categories,
    extras: [
      'Summer Trends 2026',
      'Minimalist Jewelry',
      'Boho Chic Outfits',
      'Skincare Routine',
      'Wedding Guest Dresses',
    ],
  });

  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable, playfair.variable)}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className={cn(inter.className, "overflow-x-hidden w-full")} suppressHydrationWarning>
        <ThemeProvider>
          <div className="premium-grid" />
          <Navbar categories={categories} suggestions={suggestions} />
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
          <Footer />
          <ThemeToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
