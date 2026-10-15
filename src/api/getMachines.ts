import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';

export const useGetMachines = () => {
  return useQuery({
    queryKey: ['machines'],
    queryFn: () => runGas('getMachines'),
  });
};
