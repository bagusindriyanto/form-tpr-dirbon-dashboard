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
import { useAddProblem } from '@/api/addProblem';
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
import { useId } from 'react';
import { Textarea } from '@/components/ui/textarea';
import type { ProblemFormData } from '@/types/problem';
import {
  BadgeCheckIcon,
  PackageIcon,
  UserCog2Icon,
  WrenchIcon,
} from 'lucide-react';

const formSchema = z.object({
  line: z.string().min(1, 'Pilih satu line.'),
  problem: z.string().min(1, 'Problem wajib diisi.'),
  pic: z.enum(['Produksi', 'MT', 'Trainer', 'QC'], {
    error: 'Pilih salah satu pic.',
  }),
}) satisfies z.ZodType<ProblemFormData>;

type FormValues = z.infer<typeof formSchema>;

export default function ProblemForm() {
  const formId = useId();
  const { mutateAsync, isPending: isMutationPending } = useAddProblem();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      line: '',
      problem: '',
      pic: undefined,
    },
  });

  function onSubmit(values: FormValues) {
    toast.promise(mutateAsync(values), {
      loading: 'Menyimpan...',
      success: () => {
        form.reset();
        return 'Data berhasil disimpan!';
      },
      error: (err: Error) => ({
        message: 'Data gagal disimpan!',
        description: err.message,
      }),
    });
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
              name="problem"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Problem
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={`${formId}-${field.name}`}
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    placeholder="Ketik problem secara detail"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="pic"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    PIC
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
                      <SelectValue placeholder="Pilih PIC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>PIC</SelectLabel>
                        <SelectItem value="Produksi">
                          <span className="inline-flex gap-2 items-center">
                            <PackageIcon />
                            Produksi
                          </span>
                        </SelectItem>
                        <SelectItem value="MT">
                          <span className="inline-flex gap-2 items-center">
                            <WrenchIcon />
                            MT
                          </span>
                        </SelectItem>
                        <SelectItem value="Trainer">
                          <span className="inline-flex gap-2 items-center">
                            <UserCog2Icon />
                            Trainer
                          </span>
                        </SelectItem>
                        <SelectItem value="QC">
                          <span className="inline-flex gap-2 items-center">
                            <BadgeCheckIcon />
                            QC
                          </span>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
