import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#12121a",
};

export const metadata: Metadata = {
  title: "One Post AI — The Content Creator's Ace of Spades",
  description: "Create, schedule, and publish content across all platforms with AI-powered assistance. Viral hashtags, optimal timing, cross-platform analytics — all in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "One Post AI",
  },
  openGraph: {
    title: "One Post AI — The Content Creator's Ace of Spades",
    description: "Create, schedule, and publish content across all platforms with AI. Viral hashtags, optimal timing, cross-platform analytics.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}