import type { LineGroup } from '@/types/line';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from '@/components/ui/combobox';
import { Fragment, type ComponentProps } from 'react';
import { LINE_GROUPS } from '@/constants/lines';

type ComboboxProps = Omit<
  ComponentProps<typeof ComboboxInput>,
  'value' | 'defaultValue' | 'onChange'
> & {
  value: string;
  onValueChange: (name: string) => void;
};

export default function LineCombobox({
  value,
  onValueChange,
  ...inputProps
}: ComboboxProps) {
  return (
    <Combobox
      items={LINE_GROUPS}
      value={value || null}
      onValueChange={(line) => onValueChange(line ?? '')}
    >
      <ComboboxInput {...inputProps} showClear placeholder="Cari nama line" />
      <ComboboxContent>
        <ComboboxEmpty>Data tidak ditemukan.</ComboboxEmpty>

        <ComboboxList className="scroll-fade-y">
          {(group: LineGroup, index: number) => (
            <Fragment key={group.value}>
              {index > 0 && <ComboboxSeparator />}
              <ComboboxGroup items={group.items}>
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection>
                  {(line: string) => (
                    <ComboboxItem key={line} value={line}>
                      {line}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            </Fragment>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
