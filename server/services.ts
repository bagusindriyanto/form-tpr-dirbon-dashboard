function getOrSetCache<T>(
  key: string,
  factory: () => T,
  {
    ttl = 600,
    cache = CacheService.getScriptCache(),
    maxLength = 90_000,
  }: GetOrSetCacheOptions = {},
): T {
  const cached = cache.get(key);

  if (cached !== null) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      cache.remove(key);
    }
  }

  const value = factory();
  const json = JSON.stringify(value);

  if (json === undefined) {
    throw new Error(`Value for cache key "${key}" is not serializable`);
  }

  if (json.length <= maxLength) {
    cache.put(key, json, ttl);
  }

  return value;
}
