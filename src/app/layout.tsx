import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Shelf - AI-Powered E-Commerce Intelligence Platform",
  description:
    "Generate optimized, conversion-ready product listings for Amazon, Shopify, Walmart, and Etsy in seconds. Powered by AI.",
  keywords: [
    "AI product listings",
    "Amazon listing optimization",
    "Shopify product descriptions",
    "ecommerce AI",
    "product catalog AI",
    "listing generator",
  ],
  openGraph: {
    title: "Shelf - AI-Powered E-Commerce Intelligence Platform",
    description:
      "Generate optimized, conversion-ready product listings for Amazon, Shopify, Walmart, and Etsy in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
