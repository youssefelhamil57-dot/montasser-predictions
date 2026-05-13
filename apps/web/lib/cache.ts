/**
 * Tiny in-memory TTL cache. Survives within a single serverless invocation
 * and across hot invocations on the same instance. Not shared between
 * Vercel cold starts — that's fine for the data we cache here (sports stats,
 * fixtures lists). For cross-instance cache, swap with Upstash Redis later.
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

export interface CacheOptions {
  /** Time to live in seconds. Default: 5 minutes. */
  ttlSeconds?: number;
}

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, opts: CacheOptions = {}): void {
  const ttl = (opts.ttlSeconds ?? 300) * 1000;
  store.set(key, { value, expiresAt: Date.now() + ttl });
}

export function cacheDelete(key: string): void {
  store.delete(key);
}

/**
 * Wrap a fetcher with cache-aside semantics. Failures are not cached so the
 * next call can retry the upstream.
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts: CacheOptions = {},
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== undefined) return hit;
  const value = await fetcher();
  cacheSet(key, value, opts);
  return value;
}
