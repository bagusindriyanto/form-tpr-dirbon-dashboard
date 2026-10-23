import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';

export const useGetStyles = () => {
  return useQuery({
    queryKey: ['styles'],
    queryFn: () => runGas('getStyles'),
  });
};
