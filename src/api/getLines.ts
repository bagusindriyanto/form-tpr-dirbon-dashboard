import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';
import { LINES_QUERY_KEY } from './queryKeys';

export const useGetLines = () => {
  return useQuery({
    queryKey: LINES_QUERY_KEY,
    queryFn: () => runGas('getLines'),
    staleTime: 15 * 60 * 1000,
  });
};
