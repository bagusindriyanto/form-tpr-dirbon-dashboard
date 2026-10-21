import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SquarePlusIcon } from 'lucide-react';
import OutputForm from './OutputForm';

export default function OutputFormDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="lg" className="w-full h-14 text-base font-semibold" />
        }
      >
        <SquarePlusIcon />
        Update Output
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Form Update Output</DialogTitle>
          <DialogDescription>Masukkan data operator.</DialogDescription>
          <OutputForm />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
