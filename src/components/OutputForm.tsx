import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import OperatorCombobox from './OperatorCombobox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAddOutput } from '@/api/addOutput';
import type { OutputFormData } from '../../shared/contracts';
import { DialogFooter } from '@/components/ui/dialog';

const formSchema = z.object({
  operators: z
    .array(z.string())
    .min(1, 'Pilih minimal satu operator')
    .max(5, 'Maksimal 5 operator'),
}) satisfies z.ZodType<OutputFormData>;

type FormValues = z.infer<typeof formSchema>;

export default function OutputForm() {
  const { mutateAsync, isPending } = useAddOutput();

  const form = useForm<FormValues>({
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
    defaultValues: { operators: [] },
  });

  function onSubmit(values: FormValues) {
    toast.promise(mutateAsync(values), {
      loading: 'Menyimpan...',
      success: 'Data berhasil disimpan!',
      error: 'Data gagal disimpan!',
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet className="overflow-y-auto max-h-[70vh] -mx-4 px-4">
        <FieldGroup>
          <Controller
            name="operators"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-operators">Operator</FieldLabel>
                <OperatorCombobox
                  id="form-operators"
                  ref={field.ref} // agar RHF bisa fokus ke field saat submit gagal
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Boleh memilih lebih dari satu operator.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogFooter>
    </form>
  );
}
