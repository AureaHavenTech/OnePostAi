/**
 * OnePost AI — Circuit Breaker Pattern
 *
 * Prevents cascading failures by opening the circuit when a service fails repeatedly.
 * States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing recovery)
 *
 * Usage:
 *   import { createCircuitBreaker } from "@/lib/circuit-breaker";
 *   const breaker = createCircuitBreaker({ name: "openai", failureThreshold: 5 });
 *   const result = await breaker.call(() => openai.generate(prompt), "Mellow Sleep");
 */

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerOptions {
  name: string;
  failureThreshold?: number;
  resetTimeout?: number;
  successThreshold?: number;
  onOpen?: (info: { name: string; error: string; failures: number }) => void;
  onClose?: (info: { name: string }) => void;
}

export interface CircuitBreaker {
  call: <T>(fn: () => Promise<T>, context?: string) => Promise<T>;
  getState: () => CircuitStateInfo;
  reset: () => void;
}

export interface CircuitStateInfo {
  name: string;
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: string | null;
  openedAt: number | null;
}

export class CircuitOpenError extends Error {
  serviceName: string;
  lastError: string;
  retryInSeconds: number;
  statusCode: number;

  constructor(serviceName: string, lastError: string | undefined, retryInSeconds: number) {
    super(`Service '${serviceName}' is temporarily unavailable. Retry in ${retryInSeconds}s.`);
    this.name = "CircuitOpenError";
    this.serviceName = serviceName;
    this.lastError = lastError || "unknown";
    this.retryInSeconds = retryInSeconds;
    this.statusCode = 503;
  }
}

export function createCircuitBreaker(opts: CircuitBreakerOptions): CircuitBreaker {
  const {
    name,
    failureThreshold = 5,
    resetTimeout = 30000,
    successThreshold = 2,
    onOpen,
    onClose,
  } = opts;

  let state: CircuitState = CircuitState.CLOSED;
  let failures = 0;
  let successes = 0;
  let lastFailure: string | null = null;
  let openedAt: number | null = null;

  function getState(): CircuitStateInfo {
    return { name, state, failures, successes, lastFailure, openedAt };
  }

  async function call<T>(fn: () => Promise<T>, context = ""): Promise<T> {
    // If OPEN, check if we should transition to HALF_OPEN
    if (state === CircuitState.OPEN) {
      if (openedAt && Date.now() - openedAt >= resetTimeout) {
        console.log(`[CircuitBreaker:${name}] OPEN → HALF_OPEN (reset timeout elapsed)`);
        state = CircuitState.HALF_OPEN;
        successes = 0;
      } else {
        const remaining = Math.ceil(
          ((openedAt || Date.now()) + resetTimeout - Date.now()) / 1000
        );
        console.warn(`[CircuitBreaker:${name}] Circuit OPEN — failing fast (${remaining}s remaining)`);
        throw new CircuitOpenError(name, lastFailure || undefined, Math.max(remaining, 1));
      }
    }

    try {
      const result = await fn();

      // Success: track for recovery
      if (state === CircuitState.HALF_OPEN) {
        successes++;
        if (successes >= successThreshold) {
          closeCircuit();
        }
      } else {
        failures = 0;
      }

      return result;
    } catch (err: any) {
      failures++;
      lastFailure = err.message;

      if (state !== CircuitState.OPEN && failures >= failureThreshold) {
        openCircuit(err);
      }

      throw err;
    }
  }

  function openCircuit(err: Error) {
    state = CircuitState.OPEN;
    openedAt = Date.now();
    console.error(
      `[CircuitBreaker:${name}] CLOSED → OPEN ` +
        `(${failures} failures, threshold: ${failureThreshold}). Error: ${err.message}`
    );
    onOpen?.({ name, error: err.message, failures });
  }

  function closeCircuit() {
    state = CircuitState.CLOSED;
    failures = 0;
    successes = 0;
    openedAt = null;
    lastFailure = null;
    console.log(`[CircuitBreaker:${name}] HALF_OPEN → CLOSED (${successThreshold} successes)`);
    onClose?.({ name });
  }

  function reset() {
    state = CircuitState.CLOSED;
    failures = 0;
    successes = 0;
    openedAt = null;
    lastFailure = null;
  }

  return { call, getState, reset };
}

/**
 * Singleton circuit breakers for OnePost AI services
 */
export const breakers = {
  openai: createCircuitBreaker({
    name: "openai",
    failureThreshold: 5,
    resetTimeout: 30000,
  }),

  socialPublish: createCircuitBreaker({
    name: "social-publish",
    failureThreshold: 3,
    resetTimeout: 60000,
  }),

  imageGen: createCircuitBreaker({
    name: "image-generation",
    failureThreshold: 5,
    resetTimeout: 30000,
  }),

  videoGen: createCircuitBreaker({
    name: "video-generation",
    failureThreshold: 5,
    resetTimeout: 60000,
  }),
};
