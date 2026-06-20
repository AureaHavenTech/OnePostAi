import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One Post AI — Intelligent Content Creation & Publishing",
  description: "Create, schedule, and publish content across all platforms with AI-powered assistance.",
  manifest: "/manifest.json",
  themeColor: "#0a0a0f",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "One Post AI",
  },
  openGraph: {
    title: "One Post AI — Intelligent Content Creation & Publishing",
    description: "Create, schedule, and publish content across all platforms with AI.",
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
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
