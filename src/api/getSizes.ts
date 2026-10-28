import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';
import { SIZES_QUERY_KEY } from './queryKeys';

export const useGetSizes = () => {
  return useQuery({
    queryKey: SIZES_QUERY_KEY,
    queryFn: () => runGas('getSizes'),
    staleTime: 6 * 60 * 60 * 1000,
  });
};
