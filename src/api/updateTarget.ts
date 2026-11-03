import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { runGas } from '@/lib/gas';
import type { StyleGroup } from '@/types/style';
import type {
  Shift,
  Target,
  TargetCellChange,
  UpdateTargetData,
} from '@/types/target';
import { STYLES_QUERY_KEY, TARGETS_QUERY_KEY } from './queryKeys';

const toList = (value: TargetCellChange['value']): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const applyTargetChanges = (
  targets: Target[],
  changes: TargetCellChange[],
  styleGroup: StyleGroup | undefined,
): Target[] => {
  return targets.map((target) => {
    const rowChanges = changes.filter(
      (change) => change.rowNumber === target.rowNumber,
    );
    if (!rowChanges.length) return target;

    const next: Target = {
      ...target,
      prcs: [...target.prcs],
      parts: [...target.parts],
      operators: [...target.operators],
    };

    for (const change of rowChanges) {
      switch (change.field) {
        case 'line':
          next.line = String(change.value ?? '').trim();
          break;
        case 'shift':
          next.shift = String(change.value) as Shift;
          break;
        case 'spo':
          next.spo = String(change.value ?? '').trim();
          break;
        case 'prcs':
          next.prcs = toList(change.value);
          break;
        case 'workingHour':
          next.workingHour = Number(change.value);
          break;
        case 'leader':
          next.leader = String(change.value ?? '').trim();
          break;
        case 'operators':
          next.operators = toList(change.value);
          break;
        case 'target':
          next.target = Number(change.value);
          break;
      }
    }

    const touchedStyle = rowChanges.some(
      (change) => change.field === 'spo' || change.field === 'prcs',
    );

    if (touchedStyle) {
      const style = styleGroup?.[next.spo];

      if (style) {
        next.prcs = next.prcs.filter((prc) => style.parts[prc]);
        next.style = style.style;
        next.parts = next.prcs.map((prc) => style.parts[prc]);
      }
    }

    if (rowChanges.some((change) => change.field === 'operators')) {
      next.manPower = next.operators.length;
    }

    return next;
  });
};

export const useUpdateTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Satu antrean supaya dua edit cepat tidak saling menimpa.
    scope: { id: 'target-save' },
    mutationFn: (data: UpdateTargetData) => runGas('updateTarget', data),
    onMutate: async ({ changes }) => {
      await queryClient.cancelQueries({ queryKey: TARGETS_QUERY_KEY });
      const previous = queryClient.getQueryData<Target[]>(TARGETS_QUERY_KEY);
      const styleGroup = queryClient.getQueryData<StyleGroup>(
        STYLES_QUERY_KEY,
      );

      queryClient.setQueryData<Target[]>(TARGETS_QUERY_KEY, (old) =>
        old ? applyTargetChanges(old, changes, styleGroup) : old,
      );

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TARGETS_QUERY_KEY, context.previous);
      }

      toast.error('Gagal menyimpan perubahan target', {
        description: error instanceof Error ? error.message : String(error),
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: TARGETS_QUERY_KEY });
    },
  });
};
