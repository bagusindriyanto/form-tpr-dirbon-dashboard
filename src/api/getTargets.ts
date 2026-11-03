import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';
import { TARGETS_QUERY_KEY } from './queryKeys';

export const useGetTargets = () => {
  return useQuery({
    queryKey: TARGETS_QUERY_KEY,
    queryFn: () => runGas('getTargets'),
  });
};
