import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { type ComponentProps } from 'react';

type ComboboxProps = Omit<
  ComponentProps<typeof ComboboxInput>,
  'value' | 'defaultValue' | 'onChange'
> & {
  items: readonly string[];
  value: string;
  isPending?: boolean;
  isError?: boolean;
  onValueChange: (name: string) => void;
};

export default function FormCombobox({
  items,
  value,
  isPending = false,
  isError = false,
  onValueChange,
  ...inputProps
}: ComboboxProps) {
  return (
    <Combobox
      items={items}
      value={value || null}
      onValueChange={(nextValue) => onValueChange(nextValue ?? '')}
    >
      <ComboboxInput {...inputProps} showClear />
      <ComboboxContent>
        <ComboboxEmpty>
          {isPending ? (
            <span className="shimmer">Memuat...</span>
          ) : isError ? (
            'Gagal memuat data.'
          ) : (
            'Data tidak ditemukan.'
          )}
        </ComboboxEmpty>

        <ComboboxList className="scroll-fade-y">
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
