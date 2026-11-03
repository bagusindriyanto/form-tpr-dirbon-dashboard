import { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import {
  DataGrid,
  DataGridContainer,
  dataGridFeatures,
  type DataGridCellEditRequest,
  type DataGridCellsChangeDetails,
  type DataGridFeatures,
} from '@/components/reui/data-grid/data-grid';
import {
  DataGridCellSelection,
  type DataGridCellSelectionApi,
} from '@/components/reui/data-grid/data-grid-cell-selection';
import { DataGridColumnHeader } from '@/components/reui/data-grid/data-grid-column-header';
import { DataGridPagination } from '@/components/reui/data-grid/data-grid-pagination';
import { DataGridScrollArea } from '@/components/reui/data-grid/data-grid-scroll-area';
import { DataGridTable } from '@/components/reui/data-grid/data-grid-table';
import { Badge } from '@/components/reui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetLeaders } from '@/api/getLeaders';
import { useGetLines } from '@/api/getLines';
import { useGetOperators } from '@/api/getOperators';
import { useGetStyles } from '@/api/getStyles';
import { useGetTargets } from '@/api/getTargets';
import { useUpdateTarget } from '@/api/updateTarget';
import { cn } from '@/lib/utils';
import type { Leader } from '@/types/leader';
import type { LineGroup } from '@/types/line';
import type { StyleGroup } from '@/types/style';
import type {
  Target,
  TargetCellChange,
  TargetEditableField,
} from '@/types/target';
import {
  type ColumnDef,
  type ColumnPinningState,
  type PaginationState,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import FormCombobox from './FormCombobox';
import LeaderCombobox from './LeaderCombobox';
import OperatorCombobox from './OperatorCombobox';

const EMPTY_LINES: LineGroup[] = [];
const EMPTY_LEADERS: Leader[] = [];

const CELL_CONTROL_CLASS =
  'h-6! min-h-6! w-full rounded-none! border-0! bg-transparent! px-0! py-0! shadow-none! ring-0! outline-hidden! focus-within:ring-0! has-[[data-slot=input-group-control]:focus-visible]:border-transparent! has-[[data-slot=input-group-control]:focus-visible]:ring-0!';

function comparePrc(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true });
}

function LineCell({
  value,
  groups,
  onChange,
}: {
  value: string;
  groups: LineGroup[];
  onChange: (next: string) => void;
}) {
  return (
    <Select value={value || null} onValueChange={(next) => onChange(next ?? '')}>
      <SelectTrigger
        size="sm"
        className="h-6 w-full border-0 bg-transparent px-1 shadow-none [&_svg]:opacity-0 [&_svg]:transition-opacity in-data-[cell-focused]:[&_svg]:opacity-100"
        aria-label="Line"
      >
        <SelectValue>{value}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start" sideOffset={8}>
        {groups.map((group) => (
          <SelectGroup key={group.value}>
            <SelectLabel>{group.value}</SelectLabel>
            {group.items.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

function ShiftCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next);
      }}
    >
      <SelectTrigger
        size="sm"
        className="h-6 w-full border-0 bg-transparent px-1 shadow-none"
        aria-label="Shift"
      >
        <SelectValue>
          <Badge variant="outline">Shift {value}</Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start" sideOffset={8}>
        <SelectItem value="1">Shift 1</SelectItem>
        <SelectItem value="2">Shift 2</SelectItem>
      </SelectContent>
    </Select>
  );
}

function SpoCell({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (next: string) => void;
}) {
  return (
    <FormCombobox
      items={options}
      value={value}
      onValueChange={onChange}
      showClear={false}
      showTrigger
      data-cell-control=""
      placeholder="Pilih SPO"
      className={CELL_CONTROL_CLASS}
    />
  );
}

function PrcCell({
  spo,
  value,
  styleGroup,
  onChange,
}: {
  spo: string;
  value: string[];
  styleGroup: StyleGroup | undefined;
  onChange: (next: string[]) => void;
}) {
  const anchor = useComboboxAnchor();
  const options = useMemo(
    () => Object.keys(styleGroup?.[spo]?.parts ?? {}).sort(comparePrc),
    [styleGroup, spo],
  );
  const selected = value.filter((prc) => options.includes(prc));

  return (
    <Combobox
      multiple
      items={options}
      value={selected}
      onValueChange={(next: string[]) => {
        if (!next.length) {
          toast.error('Pilih minimal satu PRC');
          return;
        }
        onChange(next);
      }}
    >
      <ComboboxChips
        ref={anchor}
        data-cell-control=""
        className="min-h-6! w-full flex-nowrap overflow-hidden rounded-none! border-0! bg-transparent! p-0! shadow-none! ring-0! outline-hidden!"
      >
        <ComboboxValue>
          {(items: string[]) => (
            <Fragment>
              {items.slice(0, 2).map((prc) => (
                <ComboboxChip
                  key={prc}
                  showRemove={false}
                  className="rounded-none! border-0! bg-transparent! p-0!"
                >
                  <Badge variant="outline" size="sm">
                    {prc}
                  </Badge>
                </ComboboxChip>
              ))}
              {items.length > 2 && (
                <ComboboxChip
                  showRemove={false}
                  className="rounded-none! border-0! bg-transparent! p-0!"
                >
                  <Badge variant="outline" size="sm">
                    +{items.length - 2}
                  </Badge>
                </ComboboxChip>
              )}
              <ComboboxChipsInput
                placeholder={
                  items.length ? '' : options.length ? 'Pilih PRC' : 'Pilih SPO'
                }
                className={
                  items.length
                    ? 'h-6 w-0 min-w-0 flex-none border-0! bg-transparent! p-0! shadow-none! outline-hidden! focus:min-w-16 focus:flex-1'
                    : 'h-6 min-w-16 border-0! bg-transparent! p-0! shadow-none! outline-hidden!'
                }
              />
            </Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor} align="start" sideOffset={8} className="w-56">
        <ComboboxEmpty>
          {options.length
            ? 'Tidak ada PRC.'
            : 'Pilih SPO terlebih dahulu.'}
        </ComboboxEmpty>
        <ComboboxList>
          {(prc: string) => (
            <ComboboxItem key={prc} value={prc}>
              {prc}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default function TargetDataGrid() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const gridApiRef = useRef<DataGridCellSelectionApi | null>(null);

  const {
    data: targets = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useGetTargets();
  const { data: styleGroup } = useGetStyles();
  const { data: lineGroups = EMPTY_LINES } = useGetLines();
  const { data: leaders = EMPTY_LEADERS } = useGetLeaders();
  const { data: operatorGroups = [] } = useGetOperators();
  const { mutate: saveTargets, isPending: isSaving } = useUpdateTarget();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    start: ['date'],
    end: ['target'],
  });

  const operators = useMemo(
    () => operatorGroups.flatMap((group) => group.items),
    [operatorGroups],
  );
  const spoOptions = useMemo(
    () => Object.keys(styleGroup ?? {}).sort(),
    [styleGroup],
  );
  const lineOptions = useMemo(
    () => lineGroups.flatMap((group) => group.items),
    [lineGroups],
  );

  const leaderByNip = useMemo(
    () => new Map(leaders.map((leader) => [leader.nip, leader])),
    [leaders],
  );
  const operatorByNip = useMemo(
    () => new Map(operators.map((operator) => [operator.nip, operator])),
    [operators],
  );
  const leaderByValue = useMemo(() => {
    const map = new Map<string, string>();
    for (const leader of leaders) {
      map.set(leader.nip.toLowerCase(), leader.nip);
      map.set(leader.name.toLowerCase(), leader.nip);
    }
    return map;
  }, [leaders]);
  const operatorByValue = useMemo(() => {
    const map = new Map<string, string>();
    for (const operator of operators) {
      map.set(operator.nip.toLowerCase(), operator.nip);
      map.set(operator.name.toLowerCase(), operator.nip);
    }
    return map;
  }, [operators]);

  const commitChanges = useCallback(
    (changes: TargetCellChange[]) => {
      if (!changes.length) return;
      saveTargets({ changes });
    },
    [saveTargets],
  );

  const commitField = useCallback(
    (
      rowNumber: number,
      field: TargetEditableField,
      value: string | number | string[],
    ) => {
      commitChanges([{ rowNumber, field, value }]);
    },
    [commitChanges],
  );

  const changeSpo = useCallback(
    (target: Target, spo: string) => {
      const style = styleGroup?.[spo];

      if (!style) {
        toast.error('SPO tidak ditemukan', {
          description: `SPO "${spo}" tidak ada di daftar style.`,
        });
        return;
      }

      const prcs = target.prcs.filter((prc) => style.parts[prc]);
      const dropped = target.prcs.length - prcs.length;

      commitChanges([
        { rowNumber: target.rowNumber, field: 'spo', value: spo },
        { rowNumber: target.rowNumber, field: 'prcs', value: prcs },
      ]);

      if (dropped > 0) {
        toast.info(`${dropped} PRC dikosongkan`, {
          description: `PRC tersebut tidak tersedia untuk SPO ${spo}.`,
        });
      }
    },
    [commitChanges, styleGroup],
  );

  const handleCellsChange = (
    details: DataGridCellsChangeDetails<Target>,
  ) => {
    if (details.rejected.length) {
      toast.error(
        `${details.rejected.length} nilai tidak bisa diterapkan`,
      );
    }
    if (!details.changes.length) return;

    if (
      !styleGroup &&
      details.changes.some((change) => change.columnId === 'spo')
    ) {
      toast.error('Data style belum siap. Coba lagi sebentar.');
      return;
    }

    const changes: TargetCellChange[] = [];
    const rowsWithExplicitPrc = new Set(
      details.changes
        .filter((change) => change.columnId === 'prcs')
        .map((change) => change.row.rowNumber),
    );

    for (const change of details.changes) {
      const rowNumber = change.row.rowNumber;

      if (change.columnId === 'spo') {
        const spo = String(change.value ?? '').trim();
        const style = styleGroup?.[spo];
        const prcs = style
          ? change.row.prcs.filter((prc) => style.parts[prc])
          : [];

        changes.push({ rowNumber, field: 'spo', value: spo });

        // Kalau baris yang sama juga membawa PRC baru (paste satu blok),
        // jangan timpa dengan PRC lama yang sudah difilter.
        if (!rowsWithExplicitPrc.has(rowNumber)) {
          changes.push({ rowNumber, field: 'prcs', value: prcs });
        }
        continue;
      }

      changes.push({
        rowNumber,
        field: change.columnId as TargetEditableField,
        value: change.value as string | number | string[],
      });
    }

    commitChanges(changes);
  };

  const handleCellEditRequest = (
    request: DataGridCellEditRequest<Target>,
  ) => {
    if (request.initialText !== undefined) return;

    const cellSelector = 'td[data-cell-focused]';
    const control = [
      '[data-slot="select-trigger"]',
      '[data-slot="popover-trigger"]',
      'input',
      'button',
    ]
      .map((candidate) =>
        cardRef.current?.querySelector<HTMLElement>(
          `${cellSelector} ${candidate}`,
        ),
      )
      .find(Boolean);

    if (!control) return;

    control.focus();
    control.click();

    if (control instanceof HTMLInputElement) {
      control.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        }),
      );
    }
  };

  const columns = useMemo<ColumnDef<DataGridFeatures, Target>[]>(
    () => [
      {
        accessorKey: 'date',
        header: ({ column }) => (
          <DataGridColumnHeader title="Tanggal" column={column} />
        ),
        cell: (info) => info.getValue() as string,
        enableSorting: false,
        size: 108,
        meta: {
          headerTitle: 'Tanggal',
          cellClassName: 'text-xs tabular-nums text-muted-foreground',
        },
      },
      {
        accessorKey: 'line',
        header: ({ column }) => (
          <DataGridColumnHeader title="Line" column={column} />
        ),
        cell: ({ row }) => (
          <LineCell
            value={row.original.line}
            groups={lineGroups}
            onChange={(next) =>
              commitField(row.original.rowNumber, 'line', next)
            }
          />
        ),
        size: 84,
        meta: {
          headerTitle: 'Line',
          cellEdit: {
            parse: (raw) => {
              const value = raw.trim();
              return lineOptions.includes(value) ? value : undefined;
            },
            format: (value) => String(value ?? ''),
          },
        },
      },
      {
        accessorKey: 'shift',
        header: ({ column }) => (
          <DataGridColumnHeader title="Shift" column={column} />
        ),
        cell: ({ row }) => (
          <ShiftCell
            value={row.original.shift}
            onChange={(next) =>
              commitField(row.original.rowNumber, 'shift', next)
            }
          />
        ),
        size: 86,
        meta: {
          headerTitle: 'Shift',
          cellEdit: {
            parse: (raw) => {
              const value = raw.trim();
              return value === '1' || value === '2' ? value : undefined;
            },
            format: (value) => String(value ?? ''),
          },
        },
      },
      {
        accessorKey: 'spo',
        header: ({ column }) => (
          <DataGridColumnHeader title="SPO" column={column} />
        ),
        cell: ({ row }) => (
          <SpoCell
            value={row.original.spo}
            options={spoOptions}
            onChange={(next) => changeSpo(row.original, next)}
          />
        ),
        size: 150,
        meta: {
          headerTitle: 'SPO',
          cellEdit: {
            parse: (raw) => {
              const value = raw.trim();
              return spoOptions.includes(value) ? value : undefined;
            },
            format: (value) => String(value ?? ''),
          },
        },
      },
      {
        accessorKey: 'style',
        header: ({ column }) => (
          <DataGridColumnHeader title="Style" column={column} />
        ),
        cell: (info) => (
          <span className="block truncate" title={String(info.getValue() ?? '')}>
            {String(info.getValue() ?? '')}
          </span>
        ),
        enableSorting: false,
        size: 130,
        meta: {
          headerTitle: 'Style',
          cellClassName: 'text-muted-foreground',
        },
      },
      {
        accessorKey: 'prcs',
        header: ({ column }) => (
          <DataGridColumnHeader title="PRC" column={column} />
        ),
        cell: ({ row }) => (
          <PrcCell
            spo={row.original.spo}
            value={row.original.prcs}
            styleGroup={styleGroup}
            onChange={(next) =>
              commitField(row.original.rowNumber, 'prcs', next)
            }
          />
        ),
        enableSorting: false,
        size: 138,
        meta: {
          headerTitle: 'PRC',
          cellEdit: {
            parse: (raw, row) => {
              const options = Object.keys(styleGroup?.[row.spo]?.parts ?? {});
              return raw
                .split(',')
                .map((value) => value.trim().toUpperCase())
                .filter((value) => options.includes(value));
            },
            format: (value) =>
              Array.isArray(value) ? value.join(', ') : String(value ?? ''),
            clearValue: [],
          },
        },
      },
      {
        accessorKey: 'parts',
        header: ({ column }) => (
          <DataGridColumnHeader title="Part" column={column} />
        ),
        cell: (info) => {
          const parts = info.getValue() as string[];
          return (
            <span className="block truncate" title={parts.join(', ')}>
              {parts.join(', ')}
            </span>
          );
        },
        enableSorting: false,
        size: 160,
        meta: {
          headerTitle: 'Part',
          cellClassName: 'text-muted-foreground',
        },
      },
      {
        accessorKey: 'manPower',
        header: ({ column }) => (
          <DataGridColumnHeader title="MP" column={column} />
        ),
        cell: (info) => String(info.getValue() as number),
        size: 54,
        meta: {
          headerTitle: 'MP',
          cellClassName: 'text-end tabular-nums',
          headerClassName: 'justify-end',
        },
      },
      {
        accessorKey: 'workingHour',
        header: ({ column }) => (
          <DataGridColumnHeader title="Jam" column={column} />
        ),
        cell: (info) => String(info.getValue() as number),
        size: 58,
        meta: {
          headerTitle: 'Jam',
          cellClassName: 'text-end tabular-nums',
          headerClassName: 'justify-end',
          cellEdit: {
            control: 'text',
            parse: (raw) => {
              const value = Number(raw.replace(/,/g, '').trim());
              return !Number.isInteger(value) || value < 1 || value > 11
                ? undefined
                : value;
            },
            format: (value) => String(value ?? ''),
            clearValue: 1,
          },
        },
      },
      {
        accessorKey: 'leader',
        header: ({ column }) => (
          <DataGridColumnHeader title="Leader" column={column} />
        ),
        cell: ({ row }) => (
          <LeaderCombobox
            value={row.original.leader}
            onValueChange={(next) =>
              commitField(row.original.rowNumber, 'leader', next)
            }
            showClear={false}
            data-cell-control=""
            className={CELL_CONTROL_CLASS}
          />
        ),
        size: 150,
        meta: {
          headerTitle: 'Leader',
          cellEdit: {
            parse: (raw) => {
              const value = leaderByValue.get(raw.trim().toLowerCase());
              return value;
            },
            format: (value) =>
              leaderByNip.get(String(value))?.name ?? String(value ?? ''),
          },
        },
      },
      {
        accessorKey: 'operators',
        header: ({ column }) => (
          <DataGridColumnHeader title="Operator" column={column} />
        ),
        cell: ({ row }) => (
          <div data-cell-control="" className="min-w-0 w-full">
            <OperatorCombobox
              value={row.original.operators}
              onValueChange={(next) =>
                commitField(row.original.rowNumber, 'operators', next)
              }
              maxVisible={2}
              chipsClassName="min-h-6! w-full flex-nowrap overflow-hidden rounded-none! border-0! bg-transparent! p-0! shadow-none! focus-within:ring-0!"
            />
          </div>
        ),
        enableSorting: false,
        size: 220,
        meta: {
          headerTitle: 'Operator',
          cellEdit: {
            parse: (raw) => {
              return raw
                .split(',')
                .map((value) => value.trim().toLowerCase())
                .filter(Boolean)
                .map((value) => operatorByValue.get(value))
                .filter((nip): nip is string => !!nip);
            },
            format: (value) =>
              Array.isArray(value)
                ? value
                    .map(
                      (nip) =>
                        operatorByNip.get(String(nip))?.name ?? String(nip),
                    )
                    .join(', ')
                : String(value ?? ''),
            clearValue: [],
          },
        },
      },
      {
        accessorKey: 'target',
        header: ({ column }) => (
          <DataGridColumnHeader title="Target" column={column} />
        ),
        cell: (info) => String(info.getValue() as number),
        size: 70,
        meta: {
          headerTitle: 'Target',
          cellClassName: 'text-end tabular-nums font-medium',
          headerClassName: 'justify-end',
          cellEdit: {
            control: 'text',
            parse: (raw) => {
              const value = Number(raw.replace(/,/g, '').trim());
              return !Number.isInteger(value) || value < 1 ? undefined : value;
            },
            format: (value) => String(value ?? ''),
            clearValue: 1,
          },
        },
      },
    ],
    [
      changeSpo,
      commitField,
      leaderByNip,
      leaderByValue,
      lineGroups,
      lineOptions,
      operatorByNip,
      operatorByValue,
      spoOptions,
      styleGroup,
    ],
  );

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: targets,
    pageCount: Math.ceil(targets.length / pagination.pageSize),
    getRowId: (row: Target) => String(row.rowNumber),
    state: {
      pagination,
      sorting,
      columnPinning,
    },
    autoResetPageIndex: false,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnPinningChange: setColumnPinning,
  });

  return (
    <DataGrid
      table={table}
      recordCount={targets.length}
      isLoading={isPending}
      onCellsChange={handleCellsChange}
      onCellEditRequest={handleCellEditRequest}
      onCellsCopy={({ grid, cut }) => {
        const count = grid.reduce((total, line) => total + line.length, 0);
        toast.info(
          `${cut ? 'Cut' : 'Copied'} ${count} ${
            count === 1 ? 'cell' : 'cells'
          }`,
        );
      }}
      tableLayout={{
        dense: true,
        cellSelection: true,
        cellFillHandle: true,
        cellFillHandleVariant: 'square',
        cellBorder: true,
        columnsResizable: true,
        columnsPinnable: true,
      }}
      tableClassNames={{
        edgeCell:
          'first:ps-4 last:pe-4 [&:has(+[data-slot=data-grid-table-fill-body-cell]:last-child)]:pe-4 [&:has(+[data-slot=data-grid-table-fill-head-cell]:last-child)]:pe-4',
      }}
    >
      <Card ref={cardRef} className="w-full gap-3 py-3.5">
        <CardHeader className="items-center px-3.5">
          <CardTitle className="flex items-center gap-2">
            Target
            {isSaving ? (
              <Badge variant="info-light" className="text-xs">
                Menyimpan…
              </Badge>
            ) : null}
          </CardTitle>
          <CardAction>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCwIcon
                className={cn(isFetching && 'animate-spin')}
                data-icon="inline-start"
              />
              {isFetching ? 'Memuat...' : 'Refresh'}
            </Button>
          </CardAction>
        </CardHeader>

        {error ? (
          <div className="mx-3.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            Gagal memuat target: {error.message}
          </div>
        ) : null}

        <DataGridContainer className="border-y">
          <DataGridScrollArea>
            <DataGridTable />
          </DataGridScrollArea>
          <DataGridCellSelection apiRef={gridApiRef} />
        </DataGridContainer>

        <CardFooter className="border-none bg-transparent! px-3.5 py-0">
          <DataGridPagination />
        </CardFooter>
      </Card>
    </DataGrid>
  );
}
