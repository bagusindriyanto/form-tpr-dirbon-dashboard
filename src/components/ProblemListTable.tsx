import { toast } from 'sonner';
import {
  CheckSquare2Icon,
  ClipboardCheckIcon,
  ClockIcon,
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

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 flex-1" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 flex-1" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 flex-1" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 flex-1" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 flex-1" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 flex-1" />
      </TableCell>
      <TableCell className="space-x-1">
        <Button size="sm" disabled>
          <PlayIcon data-icon="inline-start" />
          Start
        </Button>
        <Button size="sm" disabled className="bg-green-600 hover:bg-green-500">
          <CheckSquare2Icon data-icon="inline-start" />
          Finish
        </Button>
      </TableCell>
    </TableRow>
  );
}

function ErrorRow({ error }: { error: Error }) {
  return (
    <TableRow>
      <TableCell colSpan={7}>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
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
    <TableRow>
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

export default function ProblemListTable() {
  const {
    data: problems,
    isFetching,
    error,
    dataUpdatedAt,
    refetch,
  } = useGetProblems();
  const { mutateAsync, isPending: isMutationPending } = useUpdateProblem();

  const handleProcess = ({ rowNumber, action }: UpdateProblemData) => {
    toast.promise(mutateAsync({ rowNumber, action }), {
      loading: 'Memproses...',
      success: 'Data berhasil diperbarui!',
      error: 'Data gagal diperbarui!',
    });
  };

  return (
    <div className="max-h-[70vh]">
      <div className="flex justify-between items-center">
        <Badge variant="outline">
          <ClockIcon data-icon="inline-start" />
          <LastUpdated dataUpdatedAt={dataUpdatedAt} />
        </Badge>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCwIcon
            className={isFetching ? 'animate-spin' : ''}
            data-icon="inline-start"
          />
          {isFetching ? 'Memperbarui...' : 'Refresh data'}
        </Button>
      </div>
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-9 text-right">ID</TableHead>
            <TableHead className="w-40">Timestamp</TableHead>
            <TableHead className="w-9">Line</TableHead>
            <TableHead>Problem</TableHead>
            <TableHead className="w-20">PIC</TableHead>
            <TableHead className="w-42">Start</TableHead>
            <TableHead className="w-41 text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isFetching ? (
            Array.from({ length: 10 }).map((_, index) => (
              <SkeletonRow key={index} />
            ))
          ) : error ? (
            <ErrorRow error={error} />
          ) : problems && problems.length === 0 ? (
            <EmptyRow />
          ) : (
            problems?.map((problem) => (
              <TableRow key={problem.id}>
                <TableCell className="tabular-nums text-right font-light">
                  {problem.id}
                </TableCell>
                <TableCell className="tabular-nums font-light">
                  {problem.timestamp}
                </TableCell>
                <TableCell className="tabular-nums font-semibold">
                  {problem.line}
                </TableCell>
                <TableCell className="whitespace-pre-wrap">
                  {problem.problem}
                </TableCell>
                <TableCell>
                  <DowntimeBadge pic={problem.pic} />
                </TableCell>
                <TableCell className="tabular-nums font-light">
                  {problem.start}
                </TableCell>
                <TableCell className="space-x-1">
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
                  >
                    <PlayIcon data-icon="inline-start" />
                    Start
                  </Button>
                  <Button
                    variant={problem.start === '' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() =>
                      handleProcess({
                        rowNumber: problem.rowNumber,
                        action: 'Finish',
                      })
                    }
                    disabled={isMutationPending || problem.start === ''}
                    className={
                      problem.start === ''
                        ? ''
                        : 'bg-green-600 hover:bg-green-500'
                    }
                  >
                    <CheckSquare2Icon data-icon="inline-start" />
                    Finish
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
