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
import { Input } from '@/components/ui/input';
import type { TargetFormData } from '../../shared/contracts';
import { useAddTarget } from '@/api/addTarget';
import LineCombobox from './LineCombobox';
import LeaderCombobox from './LeaderCombobox';
import OperatorCombobox from './OperatorCombobox';

const formSchema = z.object({
  line: z.string().min(1, 'Pilih satu meja.'),
  workingHour: z
    .number({ error: 'Jam kerja wajib diisi.' })
    .int('Jam kerja harus bilangan bulat.')
    .min(1, 'Minimal 1 jam.')
    .max(12, 'Maksimal 12 jam.'),
  leader: z.string().min(1, 'Pilih satu leader.'),
  operators: z.array(z.string()).min(1, 'Pilih minimal satu operator.'),
  target: z
    .number({ error: 'Target wajib diisi.' })
    .int('Target harus bilangan bulat.')
    .min(1, 'Target minimal 1.'),
}) satisfies z.ZodType<TargetFormData>;

type FormValues = z.infer<typeof formSchema>;

export default function TargetForm() {
  const { mutateAsync, isPending } = useAddTarget();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { line: '', leader: '', operators: [] },
  });

  function onSubmit(values: FormValues) {
    toast.promise(mutateAsync(values), {
      loading: 'Menyimpan...',
      success: () => {
        form.reset();
        return 'Data berhasil disimpan!';
      },
      error: 'Data gagal disimpan!',
    });
  }

  return (
    <>
      <form id="target-form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="overflow-y-auto max-h-[70vh] -mx-4 px-4">
          <FieldGroup>
            <Controller
              name="line"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-line">Meja</FieldLabel>
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
              name="workingHour"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-working-hour">Jam Kerja</FieldLabel>
                  <Input
                    {...field}
                    value={
                      field.value == null || Number.isNaN(field.value)
                        ? ''
                        : field.value
                    }
                    onChange={(event) =>
                      field.onChange(event.target.valueAsNumber)
                    }
                    id="form-working-hour"
                    aria-invalid={fieldState.invalid}
                    type="number"
                    min={1}
                    max={12}
                    step={1}
                    inputMode="numeric"
                    placeholder="Contoh: 8"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Lama jam kerja dalam satu hari (1–12 jam).
                  </FieldDescription>
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
                  <FieldLabel htmlFor="form-leader">Leader</FieldLabel>
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
                    Operator ({field.value.length})
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

            <Controller
              name="target"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-target">Target</FieldLabel>
                  <Input
                    {...field}
                    value={
                      field.value == null || Number.isNaN(field.value)
                        ? ''
                        : field.value
                    }
                    onChange={(event) =>
                      field.onChange(event.target.valueAsNumber)
                    }
                    id="form-target"
                    aria-invalid={fieldState.invalid}
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="Contoh: 100"
                    autoComplete="off"
                  />
                  <FieldDescription>Target komitmen.</FieldDescription>
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
        <Button type="submit" disabled={isPending} form="target-form">
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogFooter>
    </>
  );
}
