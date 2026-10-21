import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { SquarePenIcon } from 'lucide-react';

export default function ProblemFormDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="lg" className="w-full h-14 text-base font-semibold" />
        }
      >
        <SquarePenIcon />
        Tambah Problem
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Form Tambah Problem</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
