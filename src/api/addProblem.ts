import { useMutation } from '@tanstack/react-query';
import type { ProblemFormData } from '@/types/problem';
import { runGas } from '@/lib/gas';

export const useAddProblem = () => {
  return useMutation({
    mutationFn: (formData: ProblemFormData) => {
      return runGas('addProblem', formData);
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ['problems'] });
    },
  });
};
