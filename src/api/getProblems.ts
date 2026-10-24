import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';

export const useGetProblems = () => {
  return useQuery({
    queryKey: ['problems'],
    queryFn: () => runGas('getProblems'),
  });
};
