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

function invalidateCache(keys: string | string[]): void {
  const cache = CacheService.getScriptCache();
  const keysToRemove = Array.isArray(keys) ? keys : [keys];

  if (keysToRemove.length === 0) return;

  cache.removeAll(keysToRemove);
}

function findText(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  startRow: number,
  lastRow: number,
  colNumber: number,
  text: string,
  {
    matchEntireCell = false,
    matchCase = false,
    useRegularExpression = false,
  }: FindTextOptions = {},
): FindTextResult {
  if (text === '') {
    throw new Error('Text pencarian tidak boleh kosong.');
  }

  const hits = sheet
    .getRange(startRow, colNumber, lastRow - startRow + 1, 1)
    .createTextFinder(text)
    .matchEntireCell(matchEntireCell)
    .matchCase(matchCase)
    .useRegularExpression(useRegularExpression)
    .findAll();

  if (hits.length === 0) {
    return null;
  }

  return {
    firstMatchRow: hits[0].getRow(),
    lastMatchRow: hits[hits.length - 1].getRow(),
  };
}
