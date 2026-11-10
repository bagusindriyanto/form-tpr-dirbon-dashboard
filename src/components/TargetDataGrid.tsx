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
import type { DataGridI18nOverrides } from '@/components/reui/data-grid/data-grid-i18n';
import { Badge } from '@/components/reui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useGetOperators } from '@/api/getOperators';
import { useGetStyles } from '@/api/getStyles';
import { useGetTargets } from '@/api/getTargets';
import { TARGETS_QUERY_KEY } from '@/api/queryKeys';
import { useUpdateTarget } from '@/api/updateTarget';
import {
  applyTargetChanges,
  mergeTargetChanges,
  targetChangeKey,
  toTargetList,
} from '@/lib/targetChanges';
import { cn } from '@/lib/utils';
import type { Leader } from '@/types/leader';
import type { LineGroup } from '@/types/line';
import type { StyleGroup } from '@/types/style';
import type {
  Target,
  TargetCellChange,
  TargetEditableField,
} from '@/types/target';
import { useQueryClient } from '@tanstack/react-query';
import {
  type ColumnDef,
  type ColumnPinningState,
  type PaginationState,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { RefreshCwIcon, SaveIcon, Undo2Icon } from 'lucide-react';
import { toast } from 'sonner';
import FormCombobox from './FormCombobox';
import LeaderCombobox from './LeaderCombobox';
import OperatorCombobox from './OperatorCombobox';
import { LINE_GROUPS, LINE_OPTIONS } from '@/constants/lines';
import type { OperatorGroup } from '@/types/operator';

const EMPTY_LEADERS: Leader[] = [];
const EMPTY_OPERATORS: OperatorGroup[] = [];

// Semua teks bawaan ReUI data-grid (menu kolom, pagination, state) dalam
// Bahasa Indonesia. Cukup tambahkan key yang ingin diubah; sisanya memakai
// default ReUI.
const TARGET_GRID_I18N: DataGridI18nOverrides = {
  labels: {
    sortAscending: 'Naik',
    sortDescending: 'Turun',
    pinColumnStart: 'Sematkan ke kiri',
    pinColumnEnd: 'Sematkan ke kanan',
    moveColumnStart: 'Geser ke kiri',
    moveColumnEnd: 'Geser ke kanan',
    columnsMenu: 'Kolom',
    unpinColumn: (title) => `Lepas sematan kolom ${title}`,
    toggleColumns: 'Tampilkan kolom',
    rowCreate: 'Tambah baris',
    pinRow: 'Sematkan baris',
    unpinRow: 'Lepas sematan baris',
    selectRow: 'Pilih baris',
    selectAll: 'Pilih semua',
    expandRow: 'Buka baris',
    collapseRow: 'Tutup baris',
    dragToReorder: 'Tarik untuk mengurutkan',
    dragToReorderRow: 'Tarik untuk mengurutkan baris',
    reorderingUnavailable: 'Pengurutan tidak tersedia',
    loading: 'Memuat data...',
    empty: 'Tidak ada data target',
    allRowsLoaded: 'Semua data dimuat',
    rowsPerPage: 'Baris per halaman',
    paginationInfo: ({ from, to, count }) => `${from}–${to} dari ${count}`,
    previousPage: 'Halaman sebelumnya',
    nextPage: 'Halaman berikutnya',
    goToPage: (page) => `Ke halaman ${page}`,
    paginationEllipsis: '...',
    filterSelectedCount: (count) => `${count} dipilih`,
    filterNoResults: 'Tidak ada hasil.',
    filterClear: 'Hapus filter',
  },
};

const CELL_CONTROL_CLASS =
  'h-6! min-h-6! w-full rounded-none! border-0! bg-transparent! p-0! shadow-none! ring-0! outline-hidden! focus-within:ring-0! has-[[data-slot=input-group-control]:focus-visible]:border-transparent! has-[[data-slot=input-group-control]:focus-visible]:ring-0!';

function comparePrc(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true });
}

function LineCell({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      items={LINE_GROUPS}
      value={value || null}
      onValueChange={(next) => {
        if (next) onChange(next);
      }}
    >
      <ComboboxInput placeholder="Cari line" className={CELL_CONTROL_CLASS} />
      <ComboboxContent
        anchor={anchor}
        align="start"
        sideOffset={8}
        className="w-30"
      >
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
        <SelectGroup>
          <SelectLabel>Shift</SelectLabel>
          <SelectItem value="1">Shift 1</SelectItem>
          <SelectItem value="2">Shift 2</SelectItem>
        </SelectGroup>
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
      onValueChange={(next) => {
        if (!next) {
          toast.error('Pilih satu SPO');
          return;
        }
        onChange(next);
      }}
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
        className="min-h-6! w-full rounded-none! border-0! bg-transparent! p-0! shadow-none! ring-0! outline-hidden!"
      >
        <ComboboxValue>
          {(items: string[]) => (
            <Fragment>
              {items.map((prc) => (
                <ComboboxChip key={prc}>{prc}</ComboboxChip>
              ))}
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
      <ComboboxContent
        anchor={anchor}
        align="start"
        sideOffset={8}
        className="w-30"
      >
        <ComboboxEmpty>
          {options.length ? 'Tidak ada PRC.' : 'Pilih SPO terlebih dahulu.'}
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
  const saveLockRef = useRef(false);
  const queryClient = useQueryClient();

  const {
    data: targets = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useGetTargets();
  const { data: styleGroup } = useGetStyles();
  const { data: leaders = EMPTY_LEADERS } = useGetLeaders();
  const { data: operatorGroups = EMPTY_OPERATORS } = useGetOperators();
  const { mutateAsync: saveTargets, isPending: isSaving } = useUpdateTarget();

  const [pendingChanges, setPendingChanges] = useState<TargetCellChange[]>([]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    start: ['date', 'line'],
    end: ['target'],
  });

  const rows = useMemo(
    () => applyTargetChanges(targets, pendingChanges, styleGroup),
    [pendingChanges, styleGroup, targets],
  );

  // Penanda visual mengikuti antrean lokal, jadi baris dan sel yang belum
  // disimpan langsung terlihat tanpa menunggu request ke server.
  const dirtyRows = useMemo(
    () => new Set(pendingChanges.map((change) => change.rowNumber)),
    [pendingChanges],
  );
  const dirtyCells = useMemo(
    () => new Set(pendingChanges.map(targetChangeKey)),
    [pendingChanges],
  );

  const operators = useMemo(
    () => operatorGroups.flatMap((group) => group.items),
    [operatorGroups],
  );
  const spoOptions = useMemo(
    () => Object.keys(styleGroup ?? {}).sort(),
    [styleGroup],
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

  const stageChanges = useCallback((changes: TargetCellChange[]) => {
    if (!changes.length) return;

    // PRC selalu disimpan terurut supaya kolom PRC dan Part di sheet konsisten
    // dengan urutan yang dipakai TargetForm saat menambah target.
    const normalized = changes.map((change) =>
      change.field === 'prcs'
        ? { ...change, value: toTargetList(change.value).sort(comparePrc) }
        : change,
    );

    setPendingChanges((current) => mergeTargetChanges(current, normalized));
  }, []);

  const stageField = useCallback(
    (
      rowNumber: number,
      field: TargetEditableField,
      value: string | number | string[],
    ) => {
      stageChanges([{ rowNumber, field, value }]);
    },
    [stageChanges],
  );

  const handleDiscard = useCallback(() => {
    if (isSaving) return;
    setPendingChanges([]);
  }, [isSaving]);

  const handleSave = useCallback(async () => {
    if (!pendingChanges.length || isSaving || saveLockRef.current) return;

    saveLockRef.current = true;
    const changes = pendingChanges;

    try {
      await saveTargets({ changes });

      queryClient.setQueryData<Target[]>(TARGETS_QUERY_KEY, (current) =>
        current ? applyTargetChanges(current, changes, styleGroup) : current,
      );

      // Hanya hapus perubahan yang ikut tersimpan. Editan yang masuk saat
      // proses simpan berjalan tetap menunggu di antrean.
      const saved = new Set(changes);
      setPendingChanges((current) =>
        current.filter((change) => !saved.has(change)),
      );

      toast.success(`${changes.length} perubahan target disimpan`);
      void queryClient.invalidateQueries({ queryKey: TARGETS_QUERY_KEY });
    } catch {
      // Pesan error sudah ditampilkan oleh useUpdateTarget.
    } finally {
      saveLockRef.current = false;
    }
  }, [isSaving, pendingChanges, queryClient, saveTargets, styleGroup]);

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

      stageChanges([
        { rowNumber: target.rowNumber, field: 'spo', value: spo },
        { rowNumber: target.rowNumber, field: 'prcs', value: prcs },
      ]);

      if (dropped > 0) {
        toast.info(`${dropped} PRC dikosongkan`, {
          description: `PRC tersebut tidak tersedia untuk SPO ${spo}.`,
        });
      }
    },
    [stageChanges, styleGroup],
  );

  const handleCellsChange = (details: DataGridCellsChangeDetails<Target>) => {
    if (details.rejected.length) {
      toast.error(`${details.rejected.length} nilai tidak bisa diterapkan`);
    }
    if (!details.changes.length) return;

    if (
      !styleGroup &&
      details.changes.some((change) => change.columnId === 'spo')
    ) {
      toast.error('Data style belum siap. Coba lagi sebentar.');
      return;
    }

    const spoRows = new Set<number>();
    const prcsByRow = new Map<number, string[]>();

    for (const change of details.changes) {
      if (change.columnId === 'spo') {
        spoRows.add(change.row.rowNumber);
      }
      if (change.columnId === 'prcs') {
        prcsByRow.set(
          change.row.rowNumber,
          toTargetList(change.value as string | number | string[]),
        );
      }
    }

    const changes: TargetCellChange[] = [];
    let droppedPrc = 0;

    for (const change of details.changes) {
      const rowNumber = change.row.rowNumber;

      if (change.columnId === 'spo') {
        const spo = String(change.value ?? '').trim();
        const style = styleGroup?.[spo];
        const source = prcsByRow.get(rowNumber) ?? change.row.prcs;
        const prcs = style ? source.filter((prc) => style.parts[prc]) : [];

        droppedPrc += source.length - prcs.length;
        changes.push({ rowNumber, field: 'spo', value: spo });
        changes.push({ rowNumber, field: 'prcs', value: prcs });
        continue;
      }

      // PRC pada baris yang juga ganti SPO sudah difilter bersama SPO baru.
      if (change.columnId === 'prcs' && spoRows.has(rowNumber)) continue;

      changes.push({
        rowNumber,
        field: change.columnId as TargetEditableField,
        value: change.value as string | number | string[],
      });
    }

    stageChanges(changes);

    if (droppedPrc > 0) {
      toast.info(`${droppedPrc} PRC dikosongkan`, {
        description: 'PRC tersebut tidak tersedia untuk SPO baru.',
      });
    }
  };

  const handleCellEditRequest = (request: DataGridCellEditRequest<Target>) => {
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
          skeleton: <Skeleton className="h-4 w-16" />,
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
            onChange={(next) =>
              stageField(row.original.rowNumber, 'line', next)
            }
          />
        ),
        size: 88,
        meta: {
          headerTitle: 'Line',
          skeleton: <Skeleton className="h-6 w-14" />,
          cellEdit: {
            parse: (raw) => {
              const value = raw.trim();
              return LINE_OPTIONS.includes(value) ? value : undefined;
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
              stageField(row.original.rowNumber, 'shift', next)
            }
          />
        ),
        size: 108,
        meta: {
          headerTitle: 'Shift',
          skeleton: <Skeleton className="h-6 w-16" />,
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
        size: 135,
        meta: {
          headerTitle: 'SPO',
          skeleton: <Skeleton className="h-6 w-20" />,
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
          <span
            className="block truncate"
            title={String(info.getValue() ?? '')}
          >
            {String(info.getValue() ?? '')}
          </span>
        ),
        enableSorting: false,
        size: 170,
        meta: {
          headerTitle: 'Style',
          cellClassName: 'text-muted-foreground',
          skeleton: <Skeleton className="h-4 w-32" />,
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
              stageField(row.original.rowNumber, 'prcs', next)
            }
          />
        ),
        enableSorting: false,
        size: 165,
        meta: {
          headerTitle: 'PRC',
          skeleton: <Skeleton className="h-6 w-24" />,
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
          skeleton: <Skeleton className="h-4 w-28" />,
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
          cellClassName: 'text-end tabular-nums text-muted-foreground',
          headerClassName: 'justify-end',
          skeleton: <Skeleton className="ms-auto h-4 w-6" />,
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
          skeleton: <Skeleton className="ms-auto h-4 w-6" />,
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
              stageField(row.original.rowNumber, 'leader', next)
            }
            showClear={false}
            data-cell-control=""
            className={CELL_CONTROL_CLASS}
          />
        ),
        size: 170,
        meta: {
          headerTitle: 'Leader',
          skeleton: <Skeleton className="h-6 w-24" />,
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
                stageField(row.original.rowNumber, 'operators', next)
              }
              chipsClassName="min-h-6! w-full rounded-none! border-0! bg-transparent! p-0! shadow-none! focus-within:ring-0!"
            />
          </div>
        ),
        enableSorting: false,
        size: 220,
        meta: {
          headerTitle: 'Operator',
          skeleton: <Skeleton className="h-6 w-32" />,
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
          skeleton: <Skeleton className="ms-auto h-4 w-8" />,
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
      stageField,
      leaderByNip,
      leaderByValue,
      operatorByNip,
      operatorByValue,
      spoOptions,
      styleGroup,
    ],
  );

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: rows,
    pageCount: Math.ceil(rows.length / pagination.pageSize),
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
      recordCount={rows.length}
      isLoading={isPending}
      i18n={TARGET_GRID_I18N}
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
      getRowStatus={(row) =>
        dirtyRows.has(row.rowNumber) ? 'dirty' : undefined
      }
      getCellStatus={(row, columnId) =>
        dirtyCells.has(`${row.rowNumber}:${columnId}`) ? 'dirty' : undefined
      }
      tableLayout={{
        dense: true,
        cellSelection: true,
        cellFillHandle: true,
        cellFillHandleVariant: 'square',
        cellBorder: true,
        headerSticky: true,
        headerBackground: true,
        columnsResizable: true,
        columnsPinnable: true,
      }}
      tableClassNames={{
        edgeCell:
          'first:ps-4 last:pe-4 [&:has(+[data-slot=data-grid-table-fill-body-cell]:last-child)]:pe-4 [&:has(+[data-slot=data-grid-table-fill-head-cell]:last-child)]:pe-4',
      }}
    >
      <Card ref={cardRef} className="w-full gap-0 p-0">
        <CardHeader className="items-center px-3.5 py-4">
          <CardTitle className="flex items-center gap-2">
            Target
            {isSaving ? (
              <Badge variant="info-light" className="text-xs">
                Menyimpan…
              </Badge>
            ) : pendingChanges.length ? (
              <Badge variant="info-light" className="text-xs">
                {pendingChanges.length} perubahan
              </Badge>
            ) : null}
          </CardTitle>
          <CardAction className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching || isSaving}
            >
              <RefreshCwIcon
                className={cn(isFetching && 'animate-spin')}
                data-icon="inline-start"
              />
              {isFetching ? 'Memuat...' : 'Refresh'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDiscard}
              disabled={!pendingChanges.length || isSaving}
            >
              <Undo2Icon data-icon="inline-start" />
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!pendingChanges.length || isSaving}
            >
              <SaveIcon data-icon="inline-start" />
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </CardAction>
        </CardHeader>

        {error && (
          <div className="mx-3.5 mb-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            Gagal memuat data target: {error.message}
          </div>
        )}

        <DataGridContainer className="border-y">
          <DataGridScrollArea className="h-[calc(90dvh-16rem)]">
            <DataGridTable />
          </DataGridScrollArea>
          <DataGridCellSelection apiRef={gridApiRef} />
        </DataGridContainer>

        <CardFooter className="border-none bg-transparent! px-3.5">
          <DataGridPagination sizes={[10, 25, 50, 100]} />
        </CardFooter>
      </Card>
    </DataGrid>
  );
}
