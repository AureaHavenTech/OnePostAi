/**
 * SSO Config — Client-safe exports (no Node.js crypto).
 *
 * Shared between OnePost AI and Axel AI for cross-app single sign-on.
 * Import this from client components. Server routes import from @/lib/sso.
 *
 * © 2026 Aura Haven Tech. All rights reserved.
 */

export const SSO_APPS = {
  onepostai: {
    name: "OnePost AI",
    url: "https://onepostai.vercel.app",
    ssoEndpoint: "https://onepostai.vercel.app/api/auth/sso",
  },
  axelai: {
    name: "Axel AI",
    url: "https://axelai-eight.vercel.app",
    ssoEndpoint: "https://axelai-eight.vercel.app/api/auth/sso",
  },
} as const;

export type AppKey = keyof typeof SSO_APPS;

export interface SSOPayload {
  userId: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
  app: AppKey;
}

export function getSisterApps(currentApp: AppKey): Array<{
  key: AppKey;
  name: string;
  url: string;
  ssoEndpoint: string;
}> {
  return (Object.keys(SSO_APPS) as AppKey[])
    .filter((k) => k !== currentApp)
    .map((k) => ({
      key: k,
      name: SSO_APPS[k].name,
      url: SSO_APPS[k].url,
      ssoEndpoint: SSO_APPS[k].ssoEndpoint,
    }));
}
