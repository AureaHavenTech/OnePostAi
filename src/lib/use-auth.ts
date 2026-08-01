// /lib/use-auth.ts — client-side auth helpers
"use client";

import { useEffect, useState, useCallback } from "react";

export interface ClientUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "user";
  subscriptionTier: string;
  authProvider: string;
  emailVerified: boolean;
}

export interface UseAuth {
  user: ClientUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<ClientUser>;
  signup: (email: string, password: string, name?: string) => Promise<ClientUser>;
  loginWithFounderCode: (code: string) => Promise<ClientUser>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuth {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      await refresh();
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [refresh]);

  const postJson = useCallback(async (url: string, body: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.error || "Request failed");
    }
    return data;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await postJson("/api/auth/login", { email, password });
      setUser(data.user);
      return data.user;
    },
    [postJson]
  );

  const signup = useCallback(
    async (email: string, password: string, name?: string) => {
      const data = await postJson("/api/auth/signup", { email, password, name });
      setUser(data.user);
      return data.user;
    },
    [postJson]
  );

  const loginWithFounderCode = useCallback(
    async (code: string) => {
      const data = await postJson("/api/auth/founder", { code });
      setUser(data.user);
      return data.user;
    },
    [postJson]
  );

  const loginWithGoogle = useCallback(async () => {
    // Fetch the authorize URL, then redirect.
    const res = await fetch("/api/auth/google", { credentials: "include" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || "Google sign-in is not configured.");
    }
    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error("Google sign-in did not return a URL.");
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  return { user, loading, login, signup, loginWithFounderCode, loginWithGoogle, logout, refresh };
}
