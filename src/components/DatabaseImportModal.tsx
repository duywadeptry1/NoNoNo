import { useState } from 'react';
import {
  CloudDownload,
  Code,
  Database,
  FileUp,
  RefreshCw,
  Table2,
  X,
} from 'lucide-react';
import { SAMPLE_IMPORT_CSV, SAMPLE_IMPORT_JSON } from '../data/seedData';

interface DatabaseImportModalProps {
  isOpen: boolean;
  ordersCount: number;
  servicesCount: number;
  revenuesCount: number;
  payload: string;
  onPayloadChange: (val: string) => void;
  onImportJson: (payload: string) => void;
  onImportCsv: (payload: string) => void;
  onExportCurrentDb: () => void;
  onResetDatabase: () => void;
  onClose: () => void;
}

export function DatabaseImportModal({
  isOpen,
  ordersCount,
  servicesCount,
  revenuesCount,
  payload,
  onPayloadChange,
  onImportJson,
  onImportCsv,
  onExportCurrentDb,
  onResetDatabase,
  onClose,
}: DatabaseImportModalProps) {
  const [isCsvMode, setIsCsvMode] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const isCsv = file.name.toLowerCase().endsWith('.csv');
    setIsCsvMode(isCsv);
    onPayloadChange(text);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="db-import-title"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl dark:bg-[#151E2E]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-[#1A56FA]" />
            <div>
              <h2
                id="db-import-title"
                className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]"
              >
                Quản lý & Nhập dữ liệu Database
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Đồng bộ JSON / CSV với Express API & Room SQLite Schema
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng trình quản lý Database"
            className="rounded-xl p-2 text-[#64748B] hover:bg-slate-100 dark:hover:bg-[#1E293B]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live DB Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-[#F8FAFC] p-3.5 text-center dark:bg-[#1E293B]">
          <div>
            <p className="text-lg font-extrabold text-[#1A56FA] dark:text-blue-400">
              {ordersCount}
            </p>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Dự án / Đơn</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-[#10B981]">{servicesCount}</p>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Nhân sự / Gói</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-[#FF9500]">{revenuesCount}</p>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Ngày doanh thu</p>
          </div>
        </div>

        {/* Format Tabs */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setIsCsvMode(false);
              onPayloadChange(SAMPLE_IMPORT_JSON);
            }}
            aria-pressed={!isCsvMode}
            className={`inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              !isCsvMode
                ? 'bg-[#1A56FA] text-white'
                : 'bg-[#F1F5F9] text-[#0F172A] dark:bg-[#1E293B] dark:text-[#F8FAFC]'
            }`}
          >
            <Code className="h-4 w-4" />
            <span>JSON Database Batch</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCsvMode(true);
              onPayloadChange(SAMPLE_IMPORT_CSV);
            }}
            aria-pressed={isCsvMode}
            className={`inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
              isCsvMode
                ? 'bg-[#1A56FA] text-white'
                : 'bg-[#F1F5F9] text-[#0F172A] dark:bg-[#1E293B] dark:text-[#F8FAFC]'
            }`}
          >
            <Table2 className="h-4 w-4" />
            <span>CSV Spreadsheet</span>
          </button>
        </div>

        {/* Quick Preset & File Picker */}
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#EBF2FF] px-3 py-1.5 text-xs font-bold text-[#1A56FA] hover:bg-blue-100 dark:bg-blue-950/70 dark:text-blue-300">
            <FileUp className="h-3.5 w-3.5" />
            <span>Chọn file (.json / .csv)</span>
            <input
              type="file"
              accept=".json,.csv,text/csv,application/json"
              onChange={handleFileUpload}
              className="sr-only"
            />
          </label>
          <button
            type="button"
            onClick={() =>
              onPayloadChange(isCsvMode ? SAMPLE_IMPORT_CSV : SAMPLE_IMPORT_JSON)
            }
            className="rounded-lg bg-[#EBF2FF] px-3 py-1.5 text-xs font-bold text-[#1A56FA] hover:bg-blue-100 dark:bg-blue-950/70 dark:text-blue-300"
          >
            Mẫu +3 Dự án mới
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCsvMode(false);
              onExportCurrentDb();
            }}
            className="rounded-lg bg-[#EBF2FF] px-3 py-1.5 text-xs font-bold text-[#1A56FA] hover:bg-blue-100 dark:bg-blue-950/70 dark:text-blue-300"
          >
            Trích xuất DB hiện tại
          </button>
        </div>

        <div className="mt-3">
          <label
            htmlFor="db-payload-textarea"
            className="mb-1.5 block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]"
          >
            {isCsvMode
              ? 'Dữ liệu CSV (trackingNumber,senderName,...)'
              : 'Dữ liệu JSON (orders, services, revenues)'}
          </label>
          <textarea
            id="db-payload-textarea"
            rows={8}
            value={payload}
            onChange={(e) => onPayloadChange(e.target.value)}
            className="w-full rounded-xl border border-[#CBD5E1] bg-slate-50 p-3 font-mono text-xs text-[#0F172A] focus:border-[#1A56FA] focus:outline-none dark:border-[#2E3E55] dark:bg-[#0B111E] dark:text-[#F8FAFC]"
          />
        </div>

        <div className="mt-4 flex gap-3 border-t border-[#E2E8F0] pt-4 dark:border-[#2E3E55]">
          <button
            type="button"
            onClick={onResetDatabase}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] py-2.5 text-xs font-bold text-[#0F172A] hover:bg-slate-50 dark:border-[#2E3E55] dark:text-[#F8FAFC] dark:hover:bg-[#1E293B]"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Khôi phục gốc</span>
          </button>
          <button
            type="button"
            onClick={() => (isCsvMode ? onImportCsv(payload) : onImportJson(payload))}
            className="inline-flex flex-[1.5] items-center justify-center gap-1.5 rounded-xl bg-[#1A56FA] py-2.5 text-xs font-bold text-white hover:bg-[#1447C6]"
          >
            <CloudDownload className="h-4 w-4" />
            <span>Nhập vào Database</span>
          </button>
        </div>
      </div>
    </div>
  );
}
