import { Check, ChevronRight, Lock } from 'lucide-react';
import type { BusinessOrder, OrderStatus } from '../types/business';
import { formatVnd, getNextWorkflowAction } from '../utils/businessLogic';
import { StatusBadge } from './StatusBadge';

interface OrderCardProps {
  order: BusinessOrder;
  isSelected?: boolean;
  canQuickProgress?: boolean;
  restrictedLabel?: string;
  onSelect?: () => void;
  onQuickProgress?: (orderId: string, nextStatus: OrderStatus) => void;
}

export function OrderCard({
  order,
  isSelected,
  canQuickProgress = true,
  restrictedLabel = 'Chờ Cấp trên duyệt',
  onSelect,
  onQuickProgress,
}: OrderCardProps) {
  const nextAction = getNextWorkflowAction(order.status);
  const budgetValue = order.codVnd > 0 ? order.codVnd : order.feeVnd;

  return (
    <article
      className={`rounded-2xl border p-4 transition-colors ${
        isSelected
          ? 'border-[#1A56FA] bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/30'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono font-semibold text-[#1A56FA] dark:text-blue-400">
              {order.trackingNumber}
            </span>
            <span aria-hidden="true">·</span>
            <span>{order.senderName}</span>
            <span aria-hidden="true">·</span>
            <span>{order.createdAt}</span>
          </div>
          <h3 className="mt-1.5 text-sm font-bold leading-snug text-slate-900 dark:text-slate-100">
            {order.senderAddress}
          </h3>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {order.recipientName}
        </span>
        <span aria-hidden="true">·</span>
        <span>{order.recipientAddress}</span>
        {budgetValue > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {formatVnd(budgetValue)}
            </span>
          </>
        )}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        {onQuickProgress && canQuickProgress ? (
          <button
            type="button"
            onClick={() => onQuickProgress(order.id, nextAction.nextStatus)}
            className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1A56FA] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1447C6]"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{nextAction.label}</span>
          </button>
        ) : onQuickProgress && !canQuickProgress ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{restrictedLabel}</span>
          </span>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {order.estimatedDelivery}
          </span>
        )}

        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            aria-label={`Xem chi tiết ${order.trackingNumber}`}
            className="inline-flex min-h-[44px] items-center gap-1 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span>Chi tiết</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}
