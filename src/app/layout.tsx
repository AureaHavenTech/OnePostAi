import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "OnePost AI — Post like a pro. Without being one.",
  description: "Upload your own videos and photos and edit them in a professional-grade editing suite — or give it an idea and AI creates it for you. Full editing, auto-publishing, and cross-platform analytics in one place.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-512.png",
  },
  other: {
    "crossorigin": "use-credentials",
  },
};

import { NotificationProvider } from "@/components/ui/notifications";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#12121a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OnePost AI" />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered:', registration.scope);
                    },
                    function(err) {
                      console.log('SW registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
