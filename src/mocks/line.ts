import type { Dirbon, LineGroup, TPR } from '@/types/line';

export const createLine = (type: 'TPR' | 'Dirbon', length = 5): LineGroup => {
  if (type === 'TPR') {
    return {
      value: 'TPR',
      items: Array.from(
        { length },
        (_, i) => `T${String(i + 1).padStart(2, '0')}` as TPR,
      ),
    };
  }

  return {
    value: 'Dirbon',
    items: Array.from(
      { length },
      (_, i) => `D${String(i + 1).padStart(2, '0')}` as Dirbon,
    ),
  };
};
