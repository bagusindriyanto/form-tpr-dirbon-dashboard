import { runGas } from '@/lib/gas';
import type { Operator, OperatorGroup } from '@/types/operator';
import { useQuery } from '@tanstack/react-query';

const toGroups = (operators: Operator[]): OperatorGroup[] => {
  const bySection = new Map<string, Operator[]>();
  for (const operator of operators) {
    const key = operator.section || 'Tanpa section';
    bySection.set(key, [...(bySection.get(key) ?? []), operator]);
  }
  return [...bySection]
    .sort(([a], [b]) => a.localeCompare(b, 'id', { numeric: true }))
    .map(([section, items]) => ({
      value: section,
      items: items.sort((a, b) => a.name.localeCompare(b.name, 'id')),
    }));
};

export const useGetOperators = () => {
  return useQuery({
    queryKey: ['operators'],
    queryFn: () => runGas('getOperators'),
    select: toGroups,
  });
};
