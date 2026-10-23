import { Controller, useForm, useWatch } from 'react-hook-form';
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
import FormCombobox from './FormCombobox';
import { useGetStyles } from '@/api/getStyles';
import { useGetSizes } from '@/api/getSizes';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from './ui/input-group';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { InfoIcon } from 'lucide-react';

const formSchema = z.object({
  line: z.string().min(1, 'Pilih satu meja.'),
  shift: z.enum(['1', '2'], { error: 'Pilih salah satu shift.' }),
  type: z.enum(['SPO', 'GR'], { error: 'Pilih SPO atau GR.' }),
  spo: z.string().min(1, 'SPO wajib diisi.'),
  prc: z.string().min(1, 'PRC wajib diisi.'),
  size: z
    .string()
    .min(1, 'Ukuran wajib diisi.')
    .transform((value) => value.toUpperCase()),
  hour: z
    .number({ error: 'Jam kerja wajib diisi.' })
    .int('Jam kerja harus bilangan bulat.')
    .min(1, 'Jam kerja minimal 1 jam.')
    .max(12, 'Jam kerja maksimal 12 jam.'),
  actual: z
    .number({ error: 'Qty aktual wajib diisi.' })
    .nonnegative('Qty aktual tidak boleh negatif.')
    .int('Qty aktual harus bilangan bulat.')
    .min(1, 'Qty aktual minimal 1.'),
  repair: z
    .number({ error: 'Qty repair harus berupa angka.' })
    .int('Qty repair harus bilangan bulat.')
    .nonnegative('Qty repair tidak boleh negatif.')
    .optional(),
  reject: z
    .number({ error: 'Qty reject harus berupa angka.' })
    .int('Qty reject harus bilangan bulat.')
    .nonnegative('Qty reject tidak boleh negatif.')
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OutputForm() {
  const {
    data: styleGroup,
    isPending: isStylesPending,
    isError: isStylesError,
  } = useGetStyles();
  const {
    data: sizeGroup,
    isPending: isSizesPending,
    isError: isSizesError,
  } = useGetSizes();
  const { mutateAsync, isPending: isMutationPending } = useAddOutput();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      line: '',
      spo: '',
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

  const selectedSpo = useWatch({ control: form.control, name: 'spo' });
  const selectedPrc = useWatch({ control: form.control, name: 'prc' });
  const selectedStyle = selectedSpo
    ? (styleGroup?.[selectedSpo]?.style ?? '')
    : '';
  const selectedPart =
    selectedSpo && selectedPrc
      ? (styleGroup?.[selectedSpo]?.parts?.[selectedPrc] ?? '')
      : '';

  const spoOptions = Object.keys(styleGroup ?? {}).sort();
  const prcOptions = selectedSpo
    ? Object.keys(styleGroup?.[selectedSpo]?.parts ?? {}).sort()
    : [];
  const sizeOptions = sizeGroup?.[selectedSpo] ?? [];

  function onSubmit(values: FormValues) {
    const style = styleGroup?.[selectedSpo]?.style;
    const part = styleGroup?.[selectedSpo]?.parts?.[selectedPrc];

    if (!style || !part) {
      toast.error('Style atau Part untuk SPO ini tidak ditemukan.');
      return;
    }

    toast.promise(mutateAsync({ ...values, style, part }), {
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
        <div className="overflow-y-auto max-h-[70vh] -mx-4 px-4 pb-2">
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
                    value={field.value ?? null}
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

            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <Controller
                name="spo"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-spo">SPO</FieldLabel>
                    <FormCombobox
                      id="form-spo"
                      placeholder="Pilih SPO"
                      items={spoOptions}
                      name={field.name}
                      value={field.value}
                      aria-invalid={fieldState.invalid}
                      onValueChange={(spo) => {
                        field.onChange(spo);
                        form.setValue('prc', '', {
                          shouldDirty: true,
                        });
                      }}
                      isPending={isStylesPending}
                      isError={isStylesError}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field>
                <FieldLabel htmlFor="form-style">Style</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="form-style"
                    value={selectedStyle}
                    readOnly
                    placeholder="Style terisi otomatis"
                    disabled
                    className="truncate"
                  />
                  {selectedStyle && (
                    <Tooltip>
                      <TooltipTrigger
                        render={<InputGroupAddon align="inline-end" />}
                      >
                        <InputGroupButton variant="secondary" size="icon-xs">
                          <InfoIcon />
                        </InputGroupButton>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{selectedStyle}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </InputGroup>
              </Field>
            </div>

            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <Controller
                name="prc"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-prc">PRC</FieldLabel>
                    <FormCombobox
                      id="form-prc"
                      placeholder="Pilih PRC"
                      items={prcOptions}
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      disabled={!selectedSpo || prcOptions.length === 0}
                      isPending={isStylesPending}
                      isError={isStylesError}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field>
                <FieldLabel htmlFor="form-part">Part</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="form-part"
                    value={selectedPart}
                    readOnly
                    placeholder="Part terisi otomatis"
                    disabled
                    className="truncate"
                  />
                  {selectedPart && (
                    <Tooltip>
                      <TooltipTrigger
                        render={<InputGroupAddon align="inline-end" />}
                      >
                        <InputGroupButton variant="secondary" size="icon-xs">
                          <InfoIcon />
                        </InputGroupButton>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{selectedPart}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </InputGroup>
              </Field>
            </div>

            <Controller
              name="size"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-size">Size</FieldLabel>
                  {sizeOptions.length === 0 ? (
                    <Input
                      id="form-size"
                      {...field}
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(event.target.value.toUpperCase())
                      }
                      className="uppercase placeholder:normal-case"
                      aria-invalid={fieldState.invalid}
                      placeholder="Ketik size secara manual"
                      disabled={!selectedSpo}
                    />
                  ) : (
                    <FormCombobox
                      id="form-size"
                      placeholder="Contoh: S, M, L, XL"
                      items={sizeOptions}
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      disabled={!selectedSpo}
                      isPending={isSizesPending}
                      isError={isSizesError}
                    />
                  )}

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
                    value={field.value ?? null}
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
                  <FieldLabel htmlFor="form-repair">
                    Repair (opsional)
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.valueAsNumber;
                      field.onChange(Number.isNaN(value) ? undefined : value);
                    }}
                    id="form-repair"
                    aria-invalid={fieldState.invalid}
                    type="number"
                    min={0}
                    step={1}
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
                  <FieldLabel htmlFor="form-reject">
                    Reject (opsional)
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.valueAsNumber;
                      field.onChange(Number.isNaN(value) ? undefined : value);
                    }}
                    id="form-reject"
                    aria-invalid={fieldState.invalid}
                    type="number"
                    min={0}
                    step={1}
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
        <Button
          type="button"
          variant="outline"
          disabled={isMutationPending}
          onClick={() => form.reset()}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isMutationPending} form="output-form">
          {isMutationPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogFooter>
    </>
  );
}
