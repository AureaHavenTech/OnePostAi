"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react";

interface SisterApp {
  key: string;
  name: string;
  url: string;
  ssoEndpoint: string;
}

interface SsoBridgeProps {
  currentApp: "onepostai" | "axelai";
  sisterApps: SisterApp[];
}

/**
 * SSO Bridge — handles cross-app single sign-on.
 *
 * After login, the auth API returns an `sso` object with a one-time token
 * and sister app URLs. The login page stores this in sessionStorage.
 * This component (mounted on the dashboard) picks it up and POSTs the token
 * to each sister app's /api/auth/sso endpoint, logging the user in everywhere.
 *
 * Shows a subtle indicator when the user is connected to sister apps.
 */
export default function SsoBridge({ currentApp, sisterApps }: SsoBridgeProps) {
  const [status, setStatus] = useState<Record<string, "pending" | "syncing" | "done" | "error">>({});
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const SSO_KEY = `sso_${currentApp}`;

    // Check for pending SSO token from login
    const stored = sessionStorage.getItem(SSO_KEY);
    if (!stored) return;

    let ssoData: { token: string; sisterApps: SisterApp[] };
    try {
      ssoData = JSON.parse(stored);
    } catch {
      sessionStorage.removeItem(SSO_KEY);
      return;
    }

    if (!ssoData.token || !ssoData.sisterApps?.length) {
      sessionStorage.removeItem(SSO_KEY);
      return;
    }

    // Initialize status
    const initial: Record<string, "pending" | "syncing" | "done" | "error"> = {};
    ssoData.sisterApps.forEach((app) => {
      initial[app.key] = "pending";
    });
    setStatus(initial);

    // POST SSO token to each sister app
    const syncApp = async (app: SisterApp) => {
      setStatus((prev) => ({ ...prev, [app.key]: "syncing" }));
      try {
        const res = await fetch(app.ssoEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token: ssoData.token }),
        });
        const data = await res.json();
        if (data.success) {
          setStatus((prev) => ({ ...prev, [app.key]: "done" }));
        } else {
          setStatus((prev) => ({ ...prev, [app.key]: "error" }));
        }
      } catch (err) {
        console.error(`[sso] Failed to sync with ${app.name}:`, err);
        setStatus((prev) => ({ ...prev, [app.key]: "error" }));
      }
    };

    // Sync all sister apps in parallel
    Promise.all(ssoData.sisterApps.map(syncApp)).finally(() => {
      // Show banner briefly
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 5000);
      // Clean up stored token
      sessionStorage.removeItem(SSO_KEY);
    });
  }, [currentApp]);

  // Also check existing sessions on mount (for returning users)
  useEffect(() => {
    const checkExistingSessions = async () => {
      const results: Record<string, "done" | "error"> = {};
      for (const app of sisterApps) {
        try {
          const res = await fetch(`${app.url}/api/auth/status`, {
            credentials: "include",
          });
          const data = await res.json();
          results[app.key] = data.loggedIn ? "done" : "error";
        } catch {
          results[app.key] = "error";
        }
      }
      setStatus((prev) => ({ ...results, ...prev }));
    };

    if (sisterApps.length > 0) {
      checkExistingSessions();
    }
  }, [sisterApps]);

  const hasAny = Object.values(status).length > 0;
  if (!hasAny) return null;

  const syncingCount = Object.values(status).filter((s) => s === "syncing").length;
  const doneCount = Object.values(status).filter((s) => s === "done").length;
  const allDone = doneCount === sisterApps.length && doneCount > 0;

  return (
    <>
      {/* Persistent inline indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12121a] border border-[#1e1e2a] text-xs">
        {syncingCount > 0 ? (
          <>
            <Loader2 className="w-3 h-3 text-[#c9a96e] animate-spin" />
            <span className="text-[#e8e0d4]/70">Syncing accounts…</span>
          </>
        ) : allDone ? (
          <>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400">Connected to all apps</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3 h-3 text-[#c9a96e]" />
            <span className="text-[#e8e0d4]/70">
              {doneCount}/{sisterApps.length} connected
            </span>
          </>
        )}
      </div>

      {/* Toast banner — shown briefly after SSO sync */}
      {showBanner && allDone && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12121a] border border-emerald-500/30 rounded-xl p-4 shadow-lg shadow-emerald-500/10 animate-in slide-in-from-right">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#e8e0d4]">
                You&apos;re logged into both apps
              </p>
              <p className="text-xs text-[#e8e0d4]/50">
                OnePost AI + Axel AI are connected
              </p>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="ml-2 text-[#e8e0d4]/30 hover:text-[#e8e0d4]/60"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {!allDone && syncingCount === 0 && doneCount === 0 && Object.values(status).some((s) => s === "error") && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12121a] border border-amber-500/30 text-xs">
          <ExternalLink className="w-3 h-3 text-amber-400" />
          <span className="text-[#e8e0d4]/50">
            Visit{" "}
            {sisterApps.map((app, i) => (
              <span key={app.key}>
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c9a96e] hover:underline"
                >
                  {app.name}
                </a>
                {i < sisterApps.length - 1 && " or "}
              </span>
            ))}{" "}
            to connect
          </span>
        </div>
      )}
    </>
  );
}
