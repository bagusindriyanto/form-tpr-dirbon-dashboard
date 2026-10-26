import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { ListTodoIcon } from 'lucide-react';
import ProblemListTable from './ProblemListTable';

export default function ProblemListDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="lg" className="w-full h-14 text-base font-semibold" />
        }
      >
        <ListTodoIcon />
        Proses/Finish Problem
      </DialogTrigger>
      <DialogContent className="sm:max-w-[calc(100%-2rem)] lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Daftar Problem</DialogTitle>
        </DialogHeader>
        <ProblemListTable />
      </DialogContent>
    </Dialog>
  );
}
