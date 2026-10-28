import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { TargetFormData } from '../../shared/contracts';
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
import { useAddTarget } from '@/api/addTarget';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LineCombobox from './LineCombobox';
import LeaderCombobox from './LeaderCombobox';
import OperatorCombobox from './OperatorCombobox';
import FormCombobox from './FormCombobox';
import { useGetStyles } from '@/api/getStyles';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from './ui/input-group';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { InfoIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useId } from 'react';

const formSchema = z.object({
  line: z.string().min(1, 'Pilih satu line.'),
  shift: z.enum(['1', '2'], { error: 'Pilih salah satu shift.' }),
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
  workingHour: z
    .number({ error: 'Jam kerja wajib diisi.' })
    .int('Jam kerja harus bilangan bulat.')
    .min(1, 'Minimal 1 jam.')
    .max(11, 'Maksimal 11 jam.'),
  leader: z.string().min(1, 'Pilih satu leader.'),
  operators: z
    .array(z.string().min(1, 'Operator wajib diisi.'))
    .min(1, 'Pilih minimal satu operator.'),
  target: z
    .number({ error: 'Target wajib diisi.' })
    .int('Target harus bilangan bulat.')
    .min(1, 'Target minimal 1.'),
}) satisfies z.ZodType<Omit<TargetFormData, 'style' | 'prcs' | 'parts'>>;

type FormValues = z.infer<typeof formSchema>;

function comparePrc(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true });
}

export default function TargetForm() {
  const formId = useId();
  const {
    data: styleGroup,
    isPending: isStylesPending,
    isError: isStylesError,
  } = useGetStyles();
  const { mutateAsync, isPending } = useAddTarget();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      line: '',
      spo: '',
      prcs: [{ prc: '' }],
      shift: undefined,
      workingHour: undefined,
      leader: '',
      operators: [],
      target: undefined,
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
        error: (err: Error) => ({
          message: 'Data gagal disimpan!',
          description: err.message,
        }),
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
              name="workingHour"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Jam Kerja
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
                    max={11}
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
                            tabIndex={-1}
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
              name="leader"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Leader
                  </FieldLabel>
                  <LeaderCombobox
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
              name="operators"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Operator ({field.value.length})
                  </FieldLabel>
                  <OperatorCombobox
                    id={`${formId}-${field.name}`}
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
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Target Komitmen/hari
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
                    placeholder="Contoh: 500"
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
          disabled={isPending}
          onClick={() => form.reset()}
        >
          Reset Form
        </Button>
        <Button type="submit" disabled={isPending} form={`${formId}-form`}>
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogFooter>
    </>
  );
}
