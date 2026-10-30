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

// Batas tunggu antrean ScriptLock. Dinaikkan dari durasi normal (10-30 detik)
// supaya user kedua masih bisa menunggu user pertama selesai.
const SCRIPT_LOCK_TIMEOUT_MS = 60_000;
// Hanya catat proses antre yang benar-benar terasa, supaya log tidak penuh.
const SCRIPT_LOCK_WAIT_LOG_MS = 2_000;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Menjalankan callback secara eksklusif memakai ScriptLock.
 * Dipakai untuk operasi baca-ubah-tulis ke spreadsheet (mis. `getLastRow()`
 * lalu `appendRow()`, atau pencarian lalu pembuatan blok job di LKH) agar dua
 * user tidak menulis pada baris yang sama secara bersamaan.
 */
function withScriptLock<T>(callback: () => T): T {
  const lock = LockService.getScriptLock();
  const requestedAt = Date.now();

  if (!lock.tryLock(SCRIPT_LOCK_TIMEOUT_MS)) {
    Logger.log(
      `ScriptLock gagal didapat setelah ${SCRIPT_LOCK_TIMEOUT_MS} ms. ` +
        'Proses dibatalkan agar data tidak bentrok.',
    );
    throw new Error(
      'Server sedang memproses data lain. Silakan coba lagi dalam beberapa detik.',
    );
  }

  const waitMs = Date.now() - requestedAt;
  if (waitMs >= SCRIPT_LOCK_WAIT_LOG_MS) {
    Logger.log(`ScriptLock didapat setelah menunggu ${waitMs} ms.`);
  }

  try {
    return callback();
  } catch (error) {
    Logger.log(`Proses gagal: ${errorMessage(error)}`);
    throw error;
  } finally {
    // Pastikan perubahan tertulis sebelum lock dilepas, supaya pemegang lock
    // berikutnya membaca data terbaru.
    try {
      SpreadsheetApp.flush();
    } catch (error) {
      Logger.log(`Gagal flush perubahan spreadsheet: ${errorMessage(error)}`);
    }
    lock.releaseLock();
  }
}
