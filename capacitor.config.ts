import type { CapacitorConfig } from '@capacitor/cli';

/**
 * One Post AI — Capacitor native shell configuration.
 *
 * This app is a cloud SaaS (Next.js) hosted on Vercel. The Capacitor shell
 * loads the HOSTED web app via `server.url` (PWA-style) rather than bundling
 * offline assets, because the app's server-side routes (auth, OpenAI, Stripe)
 * cannot run inside a mobile WebView.
 *
 * Brand: One Post AI "Content That Moves" — dark gray, champagne gold, cream.
 */
const config: CapacitorConfig = {
  appId: 'com.aurahaventech.onepostai',
  appName: 'One Post AI',
  webDir: 'www',
  server: {
    url: 'https://onepostai.vercel.app',
    cleartext: false,
    androidScheme: 'https',
  },

  android: {
    backgroundColor: '#12121a',
    allowMixedContent: false,
  },

  ios: {
    backgroundColor: '#12121a',
    contentInset: 'automatic',
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#12121a',
      showSpinner: false,
    },
  },
};

export default config;
