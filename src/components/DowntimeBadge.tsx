import { Badge } from '@/components/ui/badge';
import type { PIC } from '@/types/problem';
import {
  PackageIcon,
  WrenchIcon,
  UserCog2Icon,
  type LucideIcon,
  BadgeCheckIcon,
} from 'lucide-react';

type BadgeStyling = {
  className: string;
  icon: LucideIcon;
};

type DowntimeBadgeProps = {
  pic: PIC;
};

const pics: Record<PIC, BadgeStyling> = {
  Produksi: { className: 'bg-[#EAEAFF] text-[#2A2ACC]', icon: PackageIcon },
  MT: { className: 'bg-[#F2F2F2] text-[#4D4D4D]', icon: WrenchIcon },
  Trainer: {
    className: 'bg-[#FFF0F3] text-[#B03A58]',
    icon: UserCog2Icon,
  },
  QC: { className: 'bg-[#FFF4E0] text-[#9A5B00]', icon: BadgeCheckIcon },
};

export default function DowntimeBadge({ pic }: DowntimeBadgeProps) {
  const { className: picClassName, icon: Icon } = pics[pic];

  return (
    <Badge className={picClassName}>
      <Icon data-icon="inline-start" />
      {pic}
    </Badge>
  );
}
