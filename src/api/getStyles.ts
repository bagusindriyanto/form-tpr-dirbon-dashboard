import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';
import { STYLES_QUERY_KEY } from './queryKeys';

export const useGetStyles = () => {
  return useQuery({
    queryKey: STYLES_QUERY_KEY,
    queryFn: () => runGas('getStyles'),
    staleTime: 3 * 60 * 60 * 1000,
  });
};
