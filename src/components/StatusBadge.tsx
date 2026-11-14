import { ORDER_STATUS_META, type OrderStatus } from '../types/business';

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = ORDER_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${meta.bgLight} ${meta.textLight} ${meta.bgDark} ${meta.textDark}`}
    >
      {meta.label}
    </span>
  );
}
