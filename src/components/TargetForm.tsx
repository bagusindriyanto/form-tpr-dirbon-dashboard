import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import type { TargetFormData } from '../../shared/contracts';
import { useAddTarget } from '@/api/addTarget';
import LineCombobox from './LineCombobox';
import LeaderCombobox from './LeaderCombobox';
import OperatorCombobox from './OperatorCombobox';

const formSchema = z.object({
  line: z.string().min(1, 'Pilih satu meja'),
  leader: z.string().min(1, 'Pilih satu leader'),
  operators: z
    .array(z.string())
    .min(1, 'Pilih minimal satu operator')
    .max(5, 'Maksimal lima operator'),
}) satisfies z.ZodType<TargetFormData>;

type FormValues = z.infer<typeof formSchema>;

export default function TargetForm() {
  const { mutateAsync, isPending } = useAddTarget();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { line: '', leader: '', operators: [] },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
    toast.promise(mutateAsync(values), {
      loading: 'Menyimpan...',
      success: 'Data berhasil disimpan!',
      error: 'Data gagal disimpan!',
    });
  }

  return (
    <>
      <form id="output-form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="overflow-y-auto max-h-[70vh] -mx-4 px-4">
          <FieldGroup>
            <Controller
              name="line"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-line">Pilih meja</FieldLabel>
                  <LineCombobox
                    id="form-line"
                    ref={field.ref}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="leader"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-leader">Pilih Leader</FieldLabel>
                  <LeaderCombobox
                    id="form-leader"
                    ref={field.ref}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="operators"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-operators">
                    Pilih Operator ({field.value.length})
                  </FieldLabel>
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
        </div>
      </form>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" disabled={isPending} form="output-form">
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogFooter>
    </>
  );
}
