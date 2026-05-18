import type { Metadata } from "next";
import { Inter, Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToaster } from "../components/ThemeToaster";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fashcon Admin | Control Center",
  description: "Premium admin panel for Fashcon fashion curations.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable, playfair.variable)}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript" defer></script>
      </head>
      <body className={cn(inter.className, "overflow-x-hidden w-full")}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ThemeToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
