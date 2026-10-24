import { toast } from 'sonner';
import {
  CheckSquare2Icon,
  ClipboardCheckIcon,
  PlayIcon,
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
        <Button disabled size="sm">
          <PlayIcon data-icon="inline-start" />
          Start
        </Button>
        <Button variant="outline" size="sm" disabled>
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
  const { data: problems, isPending, error } = useGetProblems();
  const { mutateAsync, isPending: isMutationPending } = useUpdateProblem();

  const handleProcess = ({ rowNumber, action }: UpdateProblemData) => {
    toast.promise(mutateAsync({ rowNumber, action }), {
      loading: 'Memproses...',
      success: 'Data berhasil diperbarui!',
      error: 'Data gagal diperbarui!',
    });
  };

  return (
    <div className="overflow-y-auto max-h-[70vh] -mx-4 px-4 pb-2">
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Timestamp</TableHead>
            <TableHead className="w-9">Line</TableHead>
            <TableHead className="w-79">Problem</TableHead>
            <TableHead className="w-18">PIC</TableHead>
            <TableHead className="w-40">Start</TableHead>
            <TableHead className="w-9">#</TableHead>
            <TableHead className="w-41 text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            Array.from({ length: 5 }).map((_, index) => (
              <SkeletonRow key={index} />
            ))
          ) : error ? (
            <ErrorRow error={error} />
          ) : problems && problems.length === 0 ? (
            <EmptyRow />
          ) : (
            problems.map((problem) => (
              <TableRow key={problem.rowNumber}>
                <TableCell className="tabular-nums">
                  {problem.timestamp}
                </TableCell>
                <TableCell className="tabular-nums">{problem.line}</TableCell>
                <TableCell className="whitespace-pre-wrap">
                  {problem.problem}
                </TableCell>
                <TableCell>{problem.pic}</TableCell>
                <TableCell className="tabular-nums">{problem.start}</TableCell>
                <TableCell>{problem.rowNumber}</TableCell>
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
