import type { LineGroup } from '@/types/line';

export const createLine = (type: 'TPR' | 'Dirbon', length = 5): LineGroup => {
  return {
    value: type,
    items: Array.from({ length }, (_, i) =>
      type === 'TPR'
        ? `T${String(i + 1).padStart(2, '0')}`
        : `D${String(i + 1).padStart(2, '0')}`,
    ),
  };
};
