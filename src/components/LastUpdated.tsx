'use no memo';

import { useRelativeTime } from '@/hooks/useRelativeTime';

export default function LastUpdated({
  dataUpdatedAt,
}: {
  dataUpdatedAt: number;
}) {
  const relativeTime = useRelativeTime(dataUpdatedAt);

  if (!dataUpdatedAt) return null;

  return <span>Diperbarui {relativeTime}</span>;
}
