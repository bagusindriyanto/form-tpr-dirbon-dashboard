import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TargetIcon } from 'lucide-react';
import TargetForm from './TargetForm';

export default function TargetFormDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="lg" className="w-full h-14 text-base font-semibold" />
        }
      >
        <TargetIcon />
        Update Target
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Form Update Target</DialogTitle>
        </DialogHeader>
        <TargetForm />
      </DialogContent>
    </Dialog>
  );
}
