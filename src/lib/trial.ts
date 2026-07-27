"use client";

const TRIAL_DURATION_DAYS = 3;

export const TRIAL_LIMITS = {
  contentGenerations: 15,
  imageGenerations: 5,
  scheduledPosts: 10,
  connectedAccounts: 2,
} as const;

export type TrialLimitKey = keyof typeof TRIAL_LIMITS;

interface TrialData {
  startDate: string;
  usage: Record<TrialLimitKey, number>;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getTrialData(): TrialData | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem("opai_trial");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TrialData;
  } catch {
    return null;
  }
}

function saveTrialData(data: TrialData): void {
  if (!isBrowser()) return;
  localStorage.setItem("opai_trial", JSON.stringify(data));
}

export function startTrial(): TrialData {
  const data: TrialData = {
    startDate: new Date().toISOString(),
    usage: {
      contentGenerations: 0,
      imageGenerations: 0,
      scheduledPosts: 0,
      connectedAccounts: 0,
    },
  };
  saveTrialData(data);
  return data;
}

export function getOrStartTrial(): TrialData {
  const existing = getTrialData();
  if (existing) return existing;
  return startTrial();
}

export function isTrialActive(): boolean {
  const data = getTrialData();
  if (!data) return false;
  const start = new Date(data.startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays < TRIAL_DURATION_DAYS;
}

export function getTrialDaysRemaining(): number {
  const data = getTrialData();
  if (!data) return 0;
  const start = new Date(data.startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const remaining = TRIAL_DURATION_DAYS - diffDays;
  return Math.max(0, Math.ceil(remaining));
}

export function getTrialHoursRemaining(): number {
  const data = getTrialData();
  if (!data) return 0;
  const start = new Date(data.startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const totalMs = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;
  const remainingMs = totalMs - diffMs;
  return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60)));
}

export function getUsage(key: TrialLimitKey): number {
  const data = getTrialData();
  if (!data) return 0;
  return data.usage[key] ?? 0;
}

export function getLimit(key: TrialLimitKey): number {
  return TRIAL_LIMITS[key];
}

export function hasReachedLimit(key: TrialLimitKey): boolean {
  return getUsage(key) >= getLimit(key);
}

export function hasReachedAnyLimit(): TrialLimitKey | null {
  for (const key of Object.keys(TRIAL_LIMITS) as TrialLimitKey[]) {
    if (hasReachedLimit(key)) return key;
  }
  return null;
}

export function getUsagePercent(key: TrialLimitKey): number {
  const usage = getUsage(key);
  const limit = getLimit(key);
  if (limit === 0) return 100;
  return Math.min(100, Math.round((usage / limit) * 100));
}

export function incrementUsage(key: TrialLimitKey): void {
  const data = getTrialData();
  if (!data) return;
  data.usage[key] = (data.usage[key] ?? 0) + 1;
  saveTrialData(data);
}

export function trackUsage(key: TrialLimitKey): { allowed: boolean; reachedLimit: boolean; remaining: number } {
  // Auto-start trial if not started
  if (!getTrialData()) {
    startTrial();
  }

  const active = isTrialActive();
  const reached = hasReachedLimit(key);
  const limit = getLimit(key);
  const used = getUsage(key);

  // Allow if trial is active and limit not reached
  const allowed = active && !reached;

  // Only increment if allowed
  if (allowed) {
    incrementUsage(key);
  }

  return {
    allowed,
    reachedLimit: reached || !active,
    remaining: Math.max(0, limit - used - (allowed ? 1 : 0)),
  };
}

export function getTrialStats() {
  const data = getTrialData();
  const active = isTrialActive();
  const daysRemaining = getTrialDaysRemaining();
  const hoursRemaining = getTrialHoursRemaining();

  const usage = data?.usage ?? {
    contentGenerations: 0,
    imageGenerations: 0,
    scheduledPosts: 0,
    connectedAccounts: 0,
  };

  return {
    active,
    daysRemaining,
    hoursRemaining,
    usage: { ...usage },
    limits: { ...TRIAL_LIMITS },
    reachedAnyLimit: hasReachedAnyLimit(),
  };
}

export function getTrialRemainingText(): string {
  const days = getTrialDaysRemaining();
  if (days > 1) return `${days} days remaining`;
  if (days === 1) return `1 day remaining`;
  const hours = getTrialHoursRemaining();
  if (hours > 1) return `${hours} hours remaining`;
  if (hours === 1) return `1 hour remaining`;
  return "Trial expired";
}

export function resetTrial(): void {
  if (!isBrowser()) return;
  localStorage.removeItem("opai_trial");
}
