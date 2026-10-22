import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { OutputFormData } from '../../shared/contracts';
import { useAddOutput } from '@/api/addOutput';
import LineCombobox from './LineCombobox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  line: z.string().min(1, 'Pilih satu meja.'),
  shift: z.enum(['1', '2'], { error: 'Pilih salah satu shift.' }),
  type: z.enum(['SPO', 'GR'], { error: 'Pilih SPO atau GR.' }),
  spo: z.string().min(1, 'SPO wajib diisi.'),
  style: z.string().min(1, 'Style wajib diisi.'),
  prc: z.string().min(1, 'PRC wajib diisi.'),
  size: z.string().min(1, 'Ukuran wajib diisi.'),
  hour: z
    .number({ error: 'Jam kerja wajib diisi.' })
    .int('Jam kerja harus bilangan bulat.')
    .min(1, 'Minimal 1 jam.')
    .max(12, 'Maksimal 12 jam.'),
  actual: z
    .number({ error: 'Qty aktual wajib diisi.' })
    .int('Qty aktual harus bilangan bulat.')
    .min(1, 'Qty aktual minimal 1.'),
  repair: z
    .number({ error: 'Qty repair wajib diisi.' })
    .int('Qty repair harus bilangan bulat.')
    .min(1, 'Qty repair minimal 1.'),
  reject: z
    .number({ error: 'Qty reject wajib diisi.' })
    .int('Qty reject harus bilangan bulat.')
    .min(1, 'Qty reject minimal 1.'),
}) satisfies z.ZodType<OutputFormData>;

type FormValues = z.infer<typeof formSchema>;

export default function OutputForm() {
  const { mutateAsync, isPending } = useAddOutput();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      line: '',
      spo: '',
      style: '',
      prc: '',
      size: '',
      type: undefined,
      shift: undefined,
      hour: undefined,
      actual: undefined,
      repair: undefined,
      reject: undefined,
    },
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
      <form id="output-form" onSubmit={form.handleSubmit(onSubmit)}>
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
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-type">Tipe</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="form-type"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Tipe</SelectLabel>
                        <SelectItem value="SPO">SPO</SelectItem>
                        <SelectItem value="GR">GR</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="spo"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-spo">SPO</FieldLabel>
                  <Input
                    {...field}
                    id="form-spo"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="style"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-style">Style</FieldLabel>
                  <Input
                    {...field}
                    id="form-style"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="prc"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-prc">PRC</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="form-prc"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Pilih PRC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>PRC</SelectLabel>
                        <SelectItem value="PRC01">PRC01</SelectItem>
                        <SelectItem value="PRC02">PRC02</SelectItem>
                        <SelectItem value="PRC03">PRC03</SelectItem>
                        <SelectItem value="PRC04">PRC04</SelectItem>
                        <SelectItem value="PRC05">PRC05</SelectItem>
                        <SelectItem value="PRC06">PRC06</SelectItem>
                        <SelectItem value="PRC07">PRC07</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="size"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-size">Size</FieldLabel>
                  <Input
                    {...field}
                    id="form-size"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="shift"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-shift">Shift</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="form-shift"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Pilih shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Shift</SelectLabel>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="hour"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-hour">Jam Ke-</FieldLabel>
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
                    id="form-hour"
                    aria-invalid={fieldState.invalid}
                    type="number"
                    min={1}
                    max={12}
                    step={1}
                    inputMode="numeric"
                    placeholder="Contoh: 8"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="actual"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-actual">Aktual</FieldLabel>
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
                    id="form-actual"
                    aria-invalid={fieldState.invalid}
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="Contoh: 100"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="repair"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-repair">Repair</FieldLabel>
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
                    id="form-reject"
                    aria-invalid={fieldState.invalid}
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="Contoh: 100"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="reject"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-reject">Reject</FieldLabel>
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
                    id="form-reject"
                    aria-invalid={fieldState.invalid}
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="Contoh: 100"
                    autoComplete="off"
                  />
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
