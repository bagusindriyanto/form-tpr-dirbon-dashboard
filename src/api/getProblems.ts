import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';
import { PROBLEMS_QUERY_KEY } from './queryKeys';

export const useGetProblems = () => {
  return useQuery({
    queryKey: PROBLEMS_QUERY_KEY,
    queryFn: () => runGas('getProblems'),
  });
};
