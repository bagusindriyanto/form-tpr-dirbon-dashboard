import { useMutation } from '@tanstack/react-query';
import type { OutputFormData } from '../../shared/contracts';
import { runGas } from '@/lib/gas';

export const useAddOutput = () => {
  return useMutation({
    mutationFn: (formData: OutputFormData) => {
      return runGas('addOutput', formData);
    },
  });
};
