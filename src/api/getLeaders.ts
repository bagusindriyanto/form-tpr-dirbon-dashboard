import { runGas } from '@/lib/gas';
import { useQuery } from '@tanstack/react-query';

export const useGetLeaders = () => {
  return useQuery({
    queryKey: ['leaders'],
    queryFn: () => runGas('getMembers'),
    select: (data) => data.leaders,
  });
};
