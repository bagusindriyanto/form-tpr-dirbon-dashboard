type GetOrSetCacheOptions = {
  ttl?: number;
  cache?: GoogleAppsScript.Cache.Cache;
  maxLength?: number;
};

type FindTextOptions = {
  matchEntireCell?: boolean;
  matchCase?: boolean;
  useRegularExpression?: boolean;
};

type FindTextResult = {
  firstMatchRow: number;
  lastMatchRow: number;
} | null;
