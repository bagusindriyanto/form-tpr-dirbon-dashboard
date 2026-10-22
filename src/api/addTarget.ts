import { useMutation } from '@tanstack/react-query';
import type { TargetFormData } from '../../shared/contracts';
import { runGas } from '@/lib/gas';

export const useAddTarget = () => {
  return useMutation({
    mutationFn: (formData: TargetFormData) => {
      return runGas('addTarget', formData);
    },
  });
};
