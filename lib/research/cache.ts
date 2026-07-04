interface CacheRecord<T> {
  value: T;
  expiresAt: number;
}

const inMemoryCache = new Map<string, CacheRecord<unknown>>();

const DEFAULT_TTL_MS = 1000 * 60 * 10;

function getRedisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }

  return { url, token };
}

export async function getCachedValue<T>(key: string): Promise<T | null> {
  const now = Date.now();
  const local = inMemoryCache.get(key);
  if (local && local.expiresAt > now) {
    return local.value as T;
  }

  const redis = getRedisConfig();
  if (!redis) {
    return null;
  }

  try {
    const response = await fetch(`${redis.url}/get/${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${redis.token}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { result?: string | null };
    if (!payload.result) {
      return null;
    }

    const parsed = JSON.parse(payload.result) as T;
    inMemoryCache.set(key, { value: parsed, expiresAt: now + DEFAULT_TTL_MS });
    return parsed;
  } catch {
    return null;
  }
}

export async function setCachedValue<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): Promise<void> {
  const expiresAt = Date.now() + ttlMs;
  inMemoryCache.set(key, { value, expiresAt });

  const redis = getRedisConfig();
  if (!redis) {
    return;
  }

  const ttlSeconds = Math.max(1, Math.floor(ttlMs / 1000));

  try {
    await fetch(`${redis.url}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redis.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: JSON.stringify(value), ex: ttlSeconds }),
    });
  } catch {
    // Best effort cache only.
  }
}
