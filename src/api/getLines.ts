import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';

export const useGetLines = () => {
  return useQuery({
    queryKey: ['lines'],
    queryFn: () => runGas('getLines'),
  });
};
