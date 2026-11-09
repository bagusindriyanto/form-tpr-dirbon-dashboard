import type { LineGroup } from '@/types/line';

export const TPR_LINES = Array.from(
  { length: 50 },
  (_, i) => `T${String(i + 1).padStart(2, '0')}`,
);
export const DIRBON_LINES = Array.from(
  { length: 10 },
  (_, i) => `D${String(i + 1).padStart(2, '0')}`,
);

export const LINE_GROUPS = [
  { value: 'TPR', items: TPR_LINES },
  { value: 'Dirbon', items: DIRBON_LINES },
] as const satisfies LineGroup[];

export const LINE_OPTIONS = LINE_GROUPS.flatMap((group) => group.items);
