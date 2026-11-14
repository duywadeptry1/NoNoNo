import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { APP_BRANCHES, APP_DEPARTMENTS } from '../data/seedData';

interface CreateTaskModalProps {
  isOpen: boolean;
  defaultBranch: string;
  onClose: () => void;
  onConfirm: (params: {
    title: string;
    assignee: string;
    departmentCode: string;
    branchName: string;
    budgetVnd?: number;
  }) => void;
}

export function CreateTaskModal({
  isOpen,
  defaultBranch,
  onClose,
  onConfirm,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [departmentCode, setDepartmentCode] = useState<string>(APP_DEPARTMENTS[0].code);
  const [branchName, setBranchName] = useState<string>(defaultBranch || APP_BRANCHES[0]);
  const [budgetText, setBudgetText] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBranchName(defaultBranch || APP_BRANCHES[0]);
      setErrorText(null);
    }
  }, [isOpen, defaultBranch]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignee.trim()) {
      setErrorText('Vui lòng nhập nội dung công việc và người phụ trách.');
      return;
    }
    const parsedBudget = Number(budgetText.replace(/[^0-9]/g, ''));
    onConfirm({
      title: title.trim(),
      assignee: assignee.trim(),
      departmentCode,
      branchName,
      budgetVnd: Number.isFinite(parsedBudget) && parsedBudget > 0 ? parsedBudget : 0,
    });
    setTitle('');
    setAssignee('');
    setBudgetText('');
    setErrorText(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl dark:bg-slate-900">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2
              id="create-task-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Tạo công việc nhanh
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lưu trực tiếp vào MongoDB để duyệt và theo dõi trên app
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại tạo công việc"
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="quick-task-title"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Nội dung công việc / Đề xuất
            </label>
            <input
              id="quick-task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Kiểm tra thiết bị POS chi nhánh Cầu Giấy"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A56FA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="quick-task-assignee"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Người phụ trách
            </label>
            <input
              id="quick-task-assignee"
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Ví dụ: Trần Thu Trang"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1A56FA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Bộ phận
            </span>
            <div className="grid grid-cols-4 gap-2">
              {APP_DEPARTMENTS.map((dept) => {
                const active = departmentCode === dept.code;
                return (
                  <button
                    key={dept.code}
                    type="button"
                    onClick={() => setDepartmentCode(dept.code)}
                    aria-pressed={active}
                    className={`min-h-[40px] rounded-xl px-2 py-2 text-xs font-semibold transition ${
                      active
                        ? 'bg-[#1A56FA] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {dept.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="quick-task-branch"
                className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Chi nhánh
              </label>
              <select
                id="quick-task-branch"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-[#1A56FA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {APP_BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="quick-task-budget"
                className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Ngân sách (tuỳ chọn, VND)
              </label>
              <input
                id="quick-task-budget"
                type="text"
                inputMode="numeric"
                value={budgetText}
                onChange={(e) => setBudgetText(e.target.value)}
                placeholder="Ví dụ: 3500000"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#1A56FA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {errorText && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-950/60 dark:text-red-300"
            >
              {errorText}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] flex-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex min-h-[44px] flex-[2] items-center justify-center gap-1.5 rounded-xl bg-[#1A56FA] text-xs font-semibold text-white hover:bg-[#1447C6]"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              <span>Lưu lên MongoDB</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
