import type { Leader } from '@/types/leader';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import { useGetLeaders } from '@/api/getLeaders';
import type { ComponentProps } from 'react';

const EMPTY: Leader[] = [];

type ComboboxProps = Omit<
  ComponentProps<typeof ComboboxInput>,
  'value' | 'defaultValue' | 'onChange'
> & {
  value: string;
  onValueChange: (nip: string) => void;
};

export default function LeaderCombobox({
  value,
  onValueChange,
  ...inputProps
}: ComboboxProps) {
  const { contains } = ComboboxPrimitive.useFilter();
  const { data: leaders = EMPTY, isPending, isError } = useGetLeaders();

  const byNip = new Map(leaders.map((leader) => [leader.nip, leader] as const));
  const selected = byNip.get(value) ?? null;

  return (
    <Combobox
      items={leaders}
      value={selected}
      onValueChange={(leader) => onValueChange(leader?.nip ?? '')}
      itemToStringLabel={(leader) => leader.name}
      itemToStringValue={(leader) => leader.nip}
      isItemEqualToValue={(a, b) => a.nip === b.nip}
      filter={(leader, query) =>
        [leader.name, leader.nip, leader.job, leader.section].some((text) =>
          contains(text, query),
        )
      }
    >
      <ComboboxInput
        {...inputProps}
        showClear
        placeholder="Cari nama, NIP, job, atau section"
      />
      <ComboboxContent>
        <ComboboxEmpty>
          {isPending ? (
            <span className="shimmer">Memuat...</span>
          ) : isError ? (
            'Gagal memuat data leader.'
          ) : (
            'Data tidak ditemukan.'
          )}
        </ComboboxEmpty>

        <ComboboxList className="scroll-fade-y">
          {(leader: Leader) => (
            <ComboboxItem key={leader.nip} value={leader}>
              <Item size="xs" className="p-0">
                <ItemContent>
                  <ItemTitle className="whitespace-nowrap">
                    {leader.name}
                  </ItemTitle>
                  <ItemDescription>
                    {leader.nip} · {leader.section} · {leader.job}
                  </ItemDescription>
                </ItemContent>
              </Item>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
