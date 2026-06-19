import type { Metadata } from "next";
import "./globals.css";

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
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}