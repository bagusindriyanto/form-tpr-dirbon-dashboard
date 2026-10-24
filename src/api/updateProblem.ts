import { useMutation } from '@tanstack/react-query';
import type { UpdateProblemData } from '@/types/problem';
import { runGas } from '@/lib/gas';

export const useUpdateProblem = () => {
  return useMutation({
    mutationFn: ({ rowNumber, action }: UpdateProblemData) => {
      return runGas('updateProblem', { rowNumber, action });
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ['problems'] });
    },
  });
};
