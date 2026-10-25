import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export function useRelativeTime(timestamp: number) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return formatDistanceToNow(timestamp, {
    addSuffix: true,
    locale: id,
  });
}
