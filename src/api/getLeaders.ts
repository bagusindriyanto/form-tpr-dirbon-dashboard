import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';
import { MEMBERS_QUERY_KEY } from './queryKeys';

export const useGetLeaders = () => {
  return useQuery({
    queryKey: MEMBERS_QUERY_KEY,
    queryFn: () => runGas('getMembers'),
    select: (data) =>
      [...data.leaders].sort((a, b) => a.name.localeCompare(b.name)),
    staleTime: 6 * 60 * 60 * 1000,
  });
};
