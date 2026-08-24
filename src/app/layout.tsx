import type { Metadata } from "next";
import "./globals.css";
import JsonLd from "@/components/json-ld";
import ThemeProvider from "@/components/theme-provider";
import KeyboardShortcuts from "@/components/keyboard-shortcuts";

export const metadata: Metadata = {
  title: "OnePost AI — Post like a pro. Without being one.",
  description: "Auto-edit, AI generate, and auto-publish content across all platforms. Zero editing skills needed. Zero camera required.",
  keywords: ["content creation", "AI video editing", "auto-publish", "UGC", "social media automation", "content creator"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OnePost AI",
  },
  openGraph: {
    title: "OnePost AI — Post like a pro. Without being one.",
    description: "Drop a raw video or just an idea. AI edits, captions, and publishes everywhere. On autopilot.",
    type: "website",
    url: "https://onepostai.vercel.app",
    siteName: "OnePost AI",
    images: [
      { url: "/op-og-image.jpg", width: 1200, height: 630, alt: "OnePost AI — Content that moves" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OnePost AI — Post like a pro. Without being one.",
    description: "Drop a raw video or just an idea. AI edits, captions, and publishes everywhere. On autopilot.",
    images: ["/op-og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/op-icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#12121a" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(){});
                });
              }
            `,
          }}
        />
        <JsonLd />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <KeyboardShortcuts />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
// deploy trigger Tue Aug 26 14:52:00 UTC 2026 — vercel redeploy
