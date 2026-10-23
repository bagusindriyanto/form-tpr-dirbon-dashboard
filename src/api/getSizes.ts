import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';

export const useGetSizes = () => {
  return useQuery({
    queryKey: ['sizes'],
    queryFn: () => runGas('getSizes'),
    staleTime: 6 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
