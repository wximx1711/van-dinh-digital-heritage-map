const cacheStore = new Map<string, { data: unknown; timestamp: number }>();
const inFlightPromises = new Map<string, Promise<unknown>>();
const DEFAULT_TTL = 30_000;

export function getCache<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > DEFAULT_TTL) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cacheStore.set(key, { data, timestamp: Date.now() });
}

export function clearCache(key?: string): void {
  if (key) {
    cacheStore.delete(key);
    inFlightPromises.delete(key);
  } else {
    cacheStore.clear();
    inFlightPromises.clear();
  }
}

export function dedupeFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (inFlightPromises.has(key)) {
    return inFlightPromises.get(key) as Promise<T>;
  }
  const promise = fetcher().finally(() => {
    inFlightPromises.delete(key);
  });
  inFlightPromises.set(key, promise);
  return promise;
}
