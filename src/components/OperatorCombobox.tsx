import { useGetOperators } from '@/api/getOperators';
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import type { Operator, OperatorGroup } from '@/types/operator';
import { Fragment, type ComponentProps } from 'react';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';

const EMPTY: OperatorGroup[] = [];

type ComboboxProps = Omit<
  ComponentProps<typeof ComboboxInput>,
  'value' | 'defaultValue' | 'onChange'
> & {
  value: string[];
  onValueChange: (nips: string[]) => void;
  /** Batasi chip yang tampil, sisanya diringkas menjadi "+N". */
  maxVisible?: number;
  chipsClassName?: string;
};

export default function OperatorCombobox({
  value,
  onValueChange,
  maxVisible,
  chipsClassName,
  ...inputProps
}: ComboboxProps) {
  const anchor = useComboboxAnchor();
  const { contains } = ComboboxPrimitive.useFilter();
  const { data: groups = EMPTY, isPending, isError } = useGetOperators();

  const byNip = new Map(
    groups
      .flatMap((group) => group.items)
      .map((operator) => [operator.nip, operator] as const),
  );
  const selected = value
    .map((nip) => byNip.get(nip))
    .filter((operator) => operator !== undefined);
  const visible =
    typeof maxVisible === 'number' ? selected.slice(0, maxVisible) : selected;
  const hiddenCount = selected.length - visible.length;

  return (
    <Combobox
      multiple
      items={groups}
      value={selected}
      onValueChange={(operators) =>
        onValueChange(operators.map((operator) => operator.nip))
      }
      itemToStringLabel={(operator) => operator.name}
      itemToStringValue={(operator) => operator.nip}
      isItemEqualToValue={(a, b) => a.nip === b.nip}
      filter={(operator, query) =>
        [operator.name, operator.nip, operator.job, operator.section].some(
          (text) => contains(text, query),
        )
      }
    >
      <ComboboxChips ref={anchor} className={chipsClassName}>
        <ComboboxValue>
          {(operators: Operator[]) => (
            <Fragment>
              {(maxVisible === undefined ? operators : visible).map(
                (operator) => (
                  <ComboboxChip key={operator.nip}>
                    {operator.name}
                  </ComboboxChip>
                ),
              )}
              {hiddenCount > 0 && (
                <ComboboxChip showRemove={false}>+{hiddenCount}</ComboboxChip>
              )}
              <ComboboxChipsInput
                {...inputProps}
                placeholder={
                  operators.length
                    ? undefined
                    : 'Cari nama, NIP, job, atau section'
                }
              />
            </Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>
          {isPending ? (
            <span className="shimmer">Memuat...</span>
          ) : isError ? (
            'Gagal memuat data operator.'
          ) : (
            'Data tidak ditemukan.'
          )}
        </ComboboxEmpty>

        <ComboboxList className="scroll-fade-y">
          {(group: OperatorGroup, index: number) => (
            <Fragment key={group.value}>
              {index > 0 && <ComboboxSeparator />}
              <ComboboxGroup items={group.items}>
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection>
                  {(operator: Operator) => (
                    <ComboboxItem key={operator.nip} value={operator}>
                      <Item size="xs" className="p-0">
                        <ItemContent>
                          <ItemTitle className="whitespace-nowrap">
                            {operator.name}
                          </ItemTitle>
                          <ItemDescription>
                            {operator.nip} · {operator.job}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
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
