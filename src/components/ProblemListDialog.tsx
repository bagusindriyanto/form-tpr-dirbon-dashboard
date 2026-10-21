import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { ListTodoIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function ProblemListDialog() {
  const handleClick = () =>
    toast.success('Event created', {
      description: 'Sunday, December 3 at 9:00 AM',
    });

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daftar Problem</DialogTitle>
        </DialogHeader>
        <div>
          <Button onClick={handleClick}>Tampilkan Toast!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
