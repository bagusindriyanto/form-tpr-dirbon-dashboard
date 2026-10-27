import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
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
import { InfoIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useId } from 'react';
import type { OutputFormData } from '../../shared/contracts';

const formSchema = z.object({
  line: z.string().min(1, 'Pilih satu line.'),
  shift: z.enum(['1', '2'], { error: 'Pilih salah satu shift.' }),
  type: z.enum(['SPO', 'GR'], { error: 'Pilih SPO atau GR.' }),
  spo: z.string().min(1, 'SPO wajib diisi.'),
  prcs: z
    .array(
      z.object({
        prc: z.string().min(1, 'PRC wajib diisi.'),
      }),
    )
    .min(1, 'Minimal satu PRC.')
    .superRefine((items, ctx) => {
      const seen = new Set<string>();

      items.forEach(({ prc }, index) => {
        if (!prc) return;

        if (seen.has(prc)) {
          ctx.addIssue({
            code: 'custom',
            path: [index, 'prc'],
            message: 'PRC ini sudah dipilih.',
          });
          return;
        }

        seen.add(prc);
      });
    }),
  size: z
    .string()
    .min(1, 'Ukuran wajib diisi.')
    .transform((value) => value.toUpperCase()),
  hour: z
    .number({ error: 'Jam kerja wajib diisi.' })
    .int('Jam kerja harus bilangan bulat.')
    .min(1, 'Jam kerja minimal 1 jam.'),
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
}) satisfies z.ZodType<Omit<OutputFormData, 'style' | 'prcs' | 'parts'>>;

type FormValues = z.infer<typeof formSchema>;

function comparePrc(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true });
}

export default function OutputForm() {
  const formId = useId();
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
      prcs: [{ prc: '' }],
      size: '',
      type: undefined,
      shift: undefined,
      hour: undefined,
      actual: undefined,
      repair: undefined,
      reject: undefined,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'prcs',
  });

  const selectedSpo = useWatch({ control: form.control, name: 'spo' });
  const selectedPrcs = useWatch({ control: form.control, name: 'prcs' });
  const selectedStyle = selectedSpo
    ? (styleGroup?.[selectedSpo]?.style ?? '')
    : '';

  const spoOptions = Object.keys(styleGroup ?? {}).sort();
  const prcOptions = selectedSpo
    ? Object.keys(styleGroup?.[selectedSpo]?.parts ?? {}).sort(comparePrc)
    : [];
  const sizeOptions = sizeGroup?.[selectedSpo] ?? [];
  const selectedPrcValues = new Set(
    (selectedPrcs ?? []).map(({ prc }) => prc).filter(Boolean),
  );

  function getPart(prc: string) {
    return selectedSpo && prc
      ? (styleGroup?.[selectedSpo]?.parts?.[prc] ?? '')
      : '';
  }

  function onSubmit(values: FormValues) {
    const style = styleGroup?.[values.spo]?.style;
    const styleParts = styleGroup?.[values.spo]?.parts;

    if (!style || !styleParts) {
      toast.error('Style atau Part untuk SPO ini tidak ditemukan.');
      return;
    }

    let hasMissingPart = false;

    values.prcs.forEach(({ prc }, index) => {
      if (styleParts[prc]) return;

      hasMissingPart = true;
      form.setError(`prcs.${index}.prc`, {
        type: 'manual',
        message: 'PRC ini tidak memiliki Part pada SPO tersebut.',
      });
    });

    if (hasMissingPart) return;

    const { prcs, ...rest } = values;
    const sortedPrcs = [...prcs].sort((a, b) => comparePrc(a.prc, b.prc));

    toast.promise(
      mutateAsync({
        ...rest,
        style,
        prcs: sortedPrcs.map(({ prc }) => prc),
        parts: sortedPrcs.map(({ prc }) => styleParts[prc]),
      }),
      {
        loading: 'Menyimpan...',
        success: () => {
          form.reset();
          return 'Data berhasil disimpan!';
        },
        error: 'Data gagal disimpan!',
      },
    );
  }

  return (
    <>
      <form id={`${formId}-form`} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="overflow-y-auto max-h-[70vh] -mx-4 px-4 pb-2">
          <FieldGroup>
            <Controller
              name="line"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Line
                  </FieldLabel>
                  <LineCombobox
                    id={`${formId}-${field.name}`}
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
              name="shift"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Shift
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={`${formId}-${field.name}`}
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
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Tipe
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={`${formId}-${field.name}`}
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
                    <FieldLabel htmlFor={`${formId}-${field.name}`}>
                      SPO
                    </FieldLabel>
                    <FormCombobox
                      id={`${formId}-${field.name}`}
                      placeholder="Pilih SPO"
                      items={spoOptions}
                      name={field.name}
                      value={field.value}
                      aria-invalid={fieldState.invalid}
                      onValueChange={(spo) => {
                        field.onChange(spo);
                        replace([{ prc: '' }]);
                        form.clearErrors('prcs');
                        form.setValue('size', '', {
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
                <FieldLabel>Style</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    value={selectedStyle}
                    readOnly
                    tabIndex={-1}
                    placeholder="Style terisi otomatis"
                    className="truncate pointer-events-none select-none cursor-default"
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

            <FieldSet className="gap-3">
              <FieldLegend variant="label">PRC</FieldLegend>
              <FieldDescription>
                Pilih satu atau lebih PRC. Part akan terisi otomatis.
              </FieldDescription>
              <FieldGroup className="gap-2">
                {fields.map((item, index) => {
                  const prc = selectedPrcs?.[index]?.prc ?? '';
                  const part = getPart(prc);
                  const rowPrcOptions = prcOptions.filter(
                    (option) =>
                      option === prc || !selectedPrcValues.has(option),
                  );

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-start gap-2"
                    >
                      <Controller
                        name={`prcs.${index}.prc`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel
                              htmlFor={`${formId}-prc-${index}`}
                              className="sr-only"
                            >
                              PRC {index + 1}
                            </FieldLabel>
                            <FormCombobox
                              id={`${formId}-prc-${index}`}
                              placeholder="Pilih PRC"
                              items={rowPrcOptions}
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
                        <FieldLabel className="sr-only">
                          Part {index + 1}
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            value={part}
                            readOnly
                            placeholder="Part terisi otomatis"
                            className="truncate pointer-events-none select-none cursor-default"
                          />
                          {(part || fields.length > 1) && (
                            <InputGroupAddon align="inline-end">
                              {part && (
                                <Tooltip>
                                  <TooltipTrigger
                                    render={
                                      <InputGroupButton
                                        type="button"
                                        variant="secondary"
                                        size="icon-xs"
                                      >
                                        <InfoIcon />
                                      </InputGroupButton>
                                    }
                                  />
                                  <TooltipContent>
                                    <p>{part}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {fields.length > 1 && (
                                <InputGroupButton
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => remove(index)}
                                  aria-label={`Hapus PRC ${index + 1}`}
                                >
                                  <Trash2Icon />
                                </InputGroupButton>
                              )}
                            </InputGroupAddon>
                          )}
                        </InputGroup>
                      </Field>
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => append({ prc: '' })}
                  disabled={!selectedSpo || fields.length >= prcOptions.length}
                >
                  <PlusIcon />
                  Tambah PRC
                </Button>
              </FieldGroup>
            </FieldSet>

            <Controller
              name="size"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Size
                  </FieldLabel>
                  {sizeOptions.length === 0 ? (
                    <Input
                      {...field}
                      id={`${formId}-${field.name}`}
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(event.target.value.toUpperCase())
                      }
                      className="uppercase placeholder:normal-case"
                      aria-invalid={fieldState.invalid}
                      placeholder={
                        !selectedSpo
                          ? 'Pilih SPO terlebih dahulu'
                          : 'Ketik size secara manual'
                      }
                      disabled={!selectedSpo}
                    />
                  ) : (
                    <FormCombobox
                      id={`${formId}-${field.name}`}
                      placeholder="Contoh: S, M, L, XL"
                      items={[...sizeOptions, 'ALL SIZE']}
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
              name="hour"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Jam Ke-
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.valueAsNumber;
                      field.onChange(Number.isNaN(value) ? undefined : value);
                    }}
                    id={`${formId}-${field.name}`}
                    aria-invalid={fieldState.invalid}
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    placeholder="Contoh: 10"
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
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Aktual
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.valueAsNumber;
                      field.onChange(Number.isNaN(value) ? undefined : value);
                    }}
                    id={`${formId}-${field.name}`}
                    aria-invalid={fieldState.invalid}
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="Contoh: 50"
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
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Repair (opsional)
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.valueAsNumber;
                      field.onChange(Number.isNaN(value) ? undefined : value);
                    }}
                    id={`${formId}-${field.name}`}
                    aria-invalid={fieldState.invalid}
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    placeholder="Contoh: 5"
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
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Reject (opsional)
                  </FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.valueAsNumber;
                      field.onChange(Number.isNaN(value) ? undefined : value);
                    }}
                    id={`${formId}-${field.name}`}
                    aria-invalid={fieldState.invalid}
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    placeholder="Contoh: 5"
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
          Reset Form
        </Button>
        <Button
          type="submit"
          disabled={isMutationPending}
          form={`${formId}-form`}
        >
          {isMutationPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogFooter>
    </>
  );
}
