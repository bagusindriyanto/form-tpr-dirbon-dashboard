import { toast } from 'sonner';
import {
  CheckSquare2Icon,
  ClipboardCheckIcon,
  ClockAlertIcon,
  ClockFadingIcon,
  ClockIcon,
  ListTodoIcon,
  PlayIcon,
  RefreshCwIcon,
  XCircleIcon,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { useGetProblems } from '@/api/getProblems';
import { useUpdateProblem } from '@/api/updateProblem';
import type { UpdateProblemData } from '@/types/problem';
import { Skeleton } from './ui/skeleton';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';
import DowntimeBadge from './DowntimeBadge';
import { Badge } from './ui/badge';
import LastUpdated from './LastUpdated';
import { cn } from '@/lib/utils';

function SkeletonRow() {
  return (
    <TableRow className="hover:bg-transparent">
      {Array.from({ length: 7 }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton
            className={cn('h-4 w-full max-w-28', index === 6 && 'max-w-full')}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}

function ErrorRow({ error }: { error: Error }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={7}>
        <Empty className="text-destructive">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="bg-destructive/10 text-destructive"
            >
              <XCircleIcon />
            </EmptyMedia>
            <EmptyTitle>Gagal memuat data</EmptyTitle>
            <EmptyDescription>{error.message}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </TableCell>
    </TableRow>
  );
}

function EmptyRow() {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={7}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardCheckIcon />
            </EmptyMedia>
            <EmptyTitle>Tidak ada problem</EmptyTitle>
            <EmptyDescription>
              Tidak ada problem yang tercatat.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </TableCell>
    </TableRow>
  );
}

function StartStatus({ start }: { start: string }) {
  if (start === '') {
    return (
      <Badge variant="destructive" className="opacity-70">
        <ClockAlertIcon data-icon="inline-start" />
        Belum diproses
      </Badge>
    );
  }

  return (
    <Badge className="bg-amber-100 text-amber-800">
      <ClockFadingIcon data-icon="inline-start" />
      {start}
    </Badge>
  );
}

export default function ProblemListTable() {
  const {
    data: problems,
    isPending,
    isFetching,
    error,
    dataUpdatedAt,
    refetch,
  } = useGetProblems();
  const { mutateAsync, isPending: isMutationPending } = useUpdateProblem();

  const handleProcess = ({ rowNumber, action }: UpdateProblemData) => {
    toast.promise(mutateAsync({ rowNumber, action }), {
      loading:
        action === 'Start'
          ? 'Memproses problem...'
          : 'Menyelesaikan problem...',
      success:
        action === 'Start' ? 'Problem diproses!' : 'Problem diselesaikan!',
      error:
        action === 'Start'
          ? 'Problem gagal diproses.'
          : 'Problem gagal diselesaikan.',
    });
  };

  return (
    <div className="flex max-h-[70vh] w-full min-w-0 max-w-full flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            <ListTodoIcon data-icon="inline-start" />
            {problems?.length ?? 0} problem
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            <ClockIcon data-icon="inline-start" />
            {isPending ? (
              'Memperbarui...'
            ) : (
              <LastUpdated dataUpdatedAt={dataUpdatedAt} />
            )}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCwIcon
            className={cn(isFetching && 'animate-spin')}
            data-icon="inline-start"
          />
          {isFetching ? 'Memperbarui...' : 'Refresh'}
        </Button>
      </div>

      {/* Table card */}
      <div className="min-h-0 w-full min-w-0 max-w-full flex-1 overflow-auto rounded-xl border bg-background shadow-sm **:data-[slot=table-container]:overflow-visible">
        <Table className="text-sm">
          <TableHeader className="sticky top-0 z-10 bg-muted/75 backdrop-blur-sm [&_tr]:border-border/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 text-right text-muted-foreground">
                ID
              </TableHead>
              <TableHead className="w-40 text-muted-foreground">
                Waktu Laporan
              </TableHead>
              <TableHead className="w-12 text-muted-foreground">Line</TableHead>
              <TableHead className="min-w-35 text-muted-foreground">
                Problem
              </TableHead>
              <TableHead className="w-24 text-muted-foreground">PIC</TableHead>
              <TableHead className="w-44 text-muted-foreground">
                Mulai Proses
              </TableHead>
              <TableHead className="w-44 text-center text-muted-foreground">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 10 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))
            ) : error ? (
              <ErrorRow error={error} />
            ) : problems && problems.length === 0 ? (
              <EmptyRow />
            ) : (
              problems?.map((problem) => (
                <TableRow
                  key={problem.id}
                  className="group/row transition-colors hover:bg-muted/40"
                >
                  <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                    {problem.id}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums text-muted-foreground">
                    {problem.timestamp}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="tabular-nums font-semibold"
                    >
                      {problem.line}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-pre-wrap font-medium">
                    <span title={problem.problem}>{problem.problem}</span>
                  </TableCell>
                  <TableCell>
                    <DowntimeBadge pic={problem.pic} />
                  </TableCell>
                  <TableCell>
                    <StartStatus start={problem.start} />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        size="sm"
                        variant={problem.start === '' ? 'default' : 'outline'}
                        onClick={() =>
                          handleProcess({
                            rowNumber: problem.rowNumber,
                            action: 'Start',
                          })
                        }
                        disabled={isMutationPending || problem.start !== ''}
                        className="font-semibold"
                      >
                        <PlayIcon data-icon="inline-start" />
                        Proses
                      </Button>
                      <Button
                        size="sm"
                        variant={problem.start === '' ? 'outline' : 'default'}
                        onClick={() =>
                          handleProcess({
                            rowNumber: problem.rowNumber,
                            action: 'Finish',
                          })
                        }
                        disabled={isMutationPending || problem.start === ''}
                        className={cn(
                          problem.start === ''
                            ? 'font-semibold'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500',
                        )}
                      >
                        <CheckSquare2Icon data-icon="inline-start" />
                        Selesai
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
