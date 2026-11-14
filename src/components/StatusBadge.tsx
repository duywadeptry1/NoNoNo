import { CheckCircle2, Clock, PauseCircle, PlayCircle } from 'lucide-react';
import { ORDER_STATUS_META, type OrderStatus } from '../types/business';

interface StatusBadgeProps {
  status: OrderStatus;
}

const STATUS_ICONS: Record<OrderStatus, typeof Clock> = {
  PENDING: Clock,
  DELIVERING: PlayCircle,
  COMPLETED: CheckCircle2,
  CANCELLED: PauseCircle,
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = ORDER_STATUS_META[status];
  const Icon = STATUS_ICONS[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold ${meta.textLight} ${meta.textDark}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}
