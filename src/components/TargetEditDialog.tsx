import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { TablePropertiesIcon } from 'lucide-react';
import TargetDataGrid from './TargetDataGrid';

export default function TargetEditDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="lg" className="w-full h-14 text-base font-semibold" />
        }
      >
        <TablePropertiesIcon />
        Edit Target
      </DialogTrigger>
      <DialogContent className="sm:max-w-[calc(100%-2rem)] lg:max-w-7xl">
        <DialogHeader>
          <DialogTitle>Edit Target</DialogTitle>
        </DialogHeader>
        <TargetDataGrid />
      </DialogContent>
    </Dialog>
  );
}
