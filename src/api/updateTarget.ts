import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { runGas } from '@/lib/gas';
import type { UpdateTargetData } from '@/types/target';

export const useUpdateTarget = () => {
  return useMutation({
    // Satu antrean supaya klik simpan beruntun tidak saling menimpa.
    scope: { id: 'target-save' },
    mutationFn: (data: UpdateTargetData) => runGas('updateTarget', data),
    onError: (error) => {
      toast.error('Gagal menyimpan perubahan target', {
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });
};
