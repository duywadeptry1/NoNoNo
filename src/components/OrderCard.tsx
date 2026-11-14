import { ArrowRight, MapPin } from 'lucide-react';
import type { BusinessOrder } from '../types/business';
import { formatVnd } from '../utils/businessLogic';
import { StatusBadge } from './StatusBadge';

interface OrderCardProps {
  order: BusinessOrder;
  isSelected?: boolean;
  onSelect?: () => void;
  onTrackClick?: () => void;
}

export function OrderCard({ order, isSelected, onSelect, onTrackClick }: OrderCardProps) {
  const budgetValue = order.codVnd > 0 ? order.codVnd : order.feeVnd;

  return (
    <article
      className={`rounded-2xl border p-4 transition-colors ${
        isSelected
          ? 'border-[#1A56FA] bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/30'
          : 'border-[#E2E8F0] bg-white hover:border-blue-300 dark:border-[#2E3E55] dark:bg-[#151E2E] dark:hover:border-blue-700'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#1A56FA] dark:text-blue-400">
              {order.trackingNumber}
            </span>
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">• {order.serviceType}</span>
          </div>
          <h3 className="mt-1 text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            {order.senderAddress}
          </h3>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 space-y-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
        <p>
          <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Đơn vị:</span>{' '}
          {order.senderName}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#FF9500]" />
          <span>
            {order.recipientName} • {order.recipientAddress}
          </span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-3 dark:border-[#2E3E55]">
        <div className="text-xs">
          <span className="text-[#64748B] dark:text-[#94A3B8]">Ngân sách: </span>
          <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            {formatVnd(budgetValue)}
          </span>
          <span className="ml-2 text-[#64748B] dark:text-[#94A3B8]">
            ({Math.round(order.weightKg)} ngày công)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onSelect && (
            <button
              type="button"
              onClick={onSelect}
              className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:bg-slate-100 dark:border-[#2E3E55] dark:text-[#F8FAFC] dark:hover:bg-[#1E293B]"
            >
              Chi tiết
            </button>
          )}
          {onTrackClick && (
            <button
              type="button"
              onClick={onTrackClick}
              aria-label={`Theo dõi tiến độ ${order.trackingNumber}`}
              className="inline-flex items-center gap-1 rounded-lg bg-[#EBF2FF] px-3 py-1.5 text-xs font-bold text-[#1A56FA] transition hover:bg-blue-100 dark:bg-blue-950/70 dark:text-blue-300 dark:hover:bg-blue-900/70"
            >
              <span>Giám sát</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
