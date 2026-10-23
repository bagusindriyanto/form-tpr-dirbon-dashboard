import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';

export const useGetStyles = () => {
  return useQuery({
    queryKey: ['styles'],
    queryFn: () => runGas('getStyles'),
    staleTime: 6 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
