import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { TablePropertiesIcon } from 'lucide-react';
import EditContent from './EditContent';

export default function EditDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="lg" className="w-full h-14 text-base font-semibold" />
        }
      >
        <TablePropertiesIcon />
        Edit Data
      </DialogTrigger>
      <DialogContent className="sm:max-w-[calc(100%-2rem)] lg:max-w-7xl min-w-0">
        <DialogHeader>
          <DialogTitle>Edit Data</DialogTitle>
        </DialogHeader>
        <EditContent />
      </DialogContent>
    </Dialog>
  );
}
