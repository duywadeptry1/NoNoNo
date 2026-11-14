import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { BusinessService } from '../types/business';
import { calculateBudgetEstimate, formatVnd } from '../utils/businessLogic';

interface CreateOrderModalProps {
  isOpen: boolean;
  services: BusinessService[];
  selectedService: BusinessService | null;
  onSelectService: (service: BusinessService) => void;
  onClose: () => void;
  onConfirm: (params: {
    recipientName: string;
    recipientAddress: string;
    weightKg: number;
    departmentCode: string;
  }) => void;
}

const DEPARTMENTS = [
  { code: 'B2B', title: 'Kinh doanh' },
  { code: 'TECH', title: 'Kỹ thuật' },
  { code: 'MKT', title: 'Marketing' },
  { code: 'FIN', title: 'Tài chính' },
];

export function CreateOrderModal({
  isOpen,
  services,
  selectedService,
  onSelectService,
  onClose,
  onConfirm,
}: CreateOrderModalProps) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [weightKg, setWeightKg] = useState(5);
  const [departmentCode, setDepartmentCode] = useState('B2B');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorText(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeService = selectedService ?? services[0];
  const { estimatedBudget, reserveFund, totalApproved } = calculateBudgetEstimate(
    activeService?.basePriceVnd ?? 32000000,
    weightKg
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientAddress.trim()) {
      setErrorText('Vui lòng nhập đầy đủ người phụ trách và tên dự án.');
      return;
    }
    onConfirm({
      recipientName: recipientName.trim(),
      recipientAddress: recipientAddress.trim(),
      weightKg,
      departmentCode,
    });
    setRecipientName('');
    setRecipientAddress('');
    setWeightKg(5);
    setErrorText(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-order-title"
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl dark:bg-[#151E2E]">
        <div className="flex items-center justify-between">
          <div>
            <h2
              id="create-order-title"
              className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]"
            >
              Khởi tạo Dự án & Quy trình mới
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Tự động dự toán ngân sách và đồng bộ Database
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại tạo dự án"
            className="rounded-xl p-2 text-[#64748B] hover:bg-slate-100 dark:hover:bg-[#1E293B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="service-template-select"
              className="mb-1.5 block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]"
            >
              Nhân sự chủ chốt / Gói giải pháp áp dụng
            </label>
            <select
              id="service-template-select"
              value={activeService?.id ?? ''}
              onChange={(e) => {
                const found = services.find((s) => s.id === e.target.value);
                if (found) onSelectService(found);
              }}
              className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-[#1A56FA] focus:outline-none dark:border-[#2E3E55] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatVnd(s.basePriceVnd)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="assignee-name-input"
              className="mb-1.5 block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]"
            >
              Quản lý / Nhân sự thực hiện (Assignee)
            </label>
            <input
              id="assignee-name-input"
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Ví dụ: Trần Thu Trang (Tech Lead)"
              className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#1A56FA] focus:outline-none dark:border-[#2E3E55] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
            />
          </div>

          <div>
            <label
              htmlFor="project-goal-input"
              className="mb-1.5 block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]"
            >
              Tên dự án / Mục tiêu bàn giao chi tiết
            </label>
            <input
              id="project-goal-input"
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Ví dụ: Dự án ERP Chi nhánh Miền Bắc"
              className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#1A56FA] focus:outline-none dark:border-[#2E3E55] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="man-days-slider"
                className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                Thời lượng / Định mức nhân công
              </label>
              <span className="text-sm font-bold text-[#1A56FA] dark:text-blue-400">
                {weightKg} ngày công
              </span>
            </div>
            <input
              id="man-days-slider"
              type="range"
              min={1}
              max={30}
              step={1}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full accent-[#1A56FA]"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Phòng ban chịu trách nhiệm chính
            </span>
            <div className="grid grid-cols-4 gap-2">
              {DEPARTMENTS.map((dept) => {
                const active = departmentCode === dept.code;
                return (
                  <button
                    key={dept.code}
                    type="button"
                    onClick={() => setDepartmentCode(dept.code)}
                    aria-pressed={active}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      active
                        ? 'bg-[#1A56FA] text-white'
                        : 'bg-[#F1F5F9] text-[#0F172A] hover:bg-slate-200 dark:bg-[#1E293B] dark:text-[#F8FAFC]'
                    }`}
                  >
                    {dept.title}
                  </button>
                );
              })}
            </div>
          </div>

          {errorText && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-950/60 dark:text-red-300">
              {errorText}
            </p>
          )}

          <div className="space-y-1.5 border-t border-[#E2E8F0] pt-4 text-xs dark:border-[#2E3E55]">
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Tổng dự toán ngân sách:</span>
              <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                {formatVnd(estimatedBudget)}
              </span>
            </div>
            <div className="flex justify-between text-[#10B981]">
              <span>Tối ưu hóa chi phí nội bộ (15%):</span>
              <span className="font-semibold">-{formatVnd(reserveFund)}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Ngân sách giải ngân duyệt cấp:
              </span>
              <span className="text-base font-extrabold text-[#1A56FA] dark:text-blue-400">
                {formatVnd(totalApproved)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#E2E8F0] py-2.5 text-xs font-bold text-[#0F172A] hover:bg-slate-50 dark:border-[#2E3E55] dark:text-[#F8FAFC] dark:hover:bg-[#1E293B]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex flex-[2] items-center justify-center gap-1.5 rounded-xl bg-[#1A56FA] py-2.5 text-xs font-bold text-white hover:bg-[#1447C6]"
            >
              <Check className="h-4 w-4" />
              <span>Phê duyệt & Lưu DB</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
