import { useMutation } from '@tanstack/react-query';
import type { TargetFormData } from '../../shared/contracts';
import { runGas } from '@/lib/gas';
import { TARGETS_QUERY_KEY } from './queryKeys';

export const useAddTarget = () => {
  return useMutation({
    mutationFn: (formData: TargetFormData) => {
      return runGas('addTarget', formData);
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: TARGETS_QUERY_KEY });
    },
  });
};
