import { useMutation } from '@tanstack/react-query';
import type { ProblemFormData } from '../../shared/contracts';
import { runGas } from '@/lib/gas';

export const useAddProblem = () => {
  return useMutation({
    mutationFn: (formData: ProblemFormData) => {
      return runGas('addProblem', formData);
    },
  });
};
