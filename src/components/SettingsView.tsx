import React, { useRef, useState } from 'react';
import { ERWSRecord } from '../types/erws';
import {
  exportToJsonFile,
  exportToCsvFile,
  importFromJsonString,
  generateSeedRecords,
} from '../utils/storage';
import {
  Download,
  Upload,
  Database,
  Trash2,
  RefreshCw,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SettingsViewProps {
  records: ERWSRecord[];
  onSetRecords: (records: ERWSRecord[]) => void;
  onShowToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  records,
  onSetRecords,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  const handleExportJson = () => {
    exportToJsonFile(records);
    onShowToast('已下載完整 JSON 備份檔');
  };

  const handleExportCsv = () => {
    exportToCsvFile(records);
    onShowToast('已匯出 CSV 表格檔案');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = importFromJsonString(text, records, importMode);
        if (result.success && result.records) {
          onSetRecords(result.records);
          onShowToast(`成功匯入 ${result.count} 筆紀錄！`);
        } else {
          onShowToast(`匯入失敗：${result.error || '檔案格式不符'}`);
        }
      } catch (err) {
        onShowToast('讀取檔案失敗，請確保為標準 JSON');
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSeedData = () => {
    if (
      records.length > 0 &&
      !confirm('確定要載入範例資料嗎？這將會添加 12 筆示範紀錄（涵蓋工作、社交、認知檢視與預警等豐富情境）。')
    ) {
      return;
    }
    const seed = generateSeedRecords();
    onSetRecords(seed);
    onShowToast('已成功載入 12 筆完整示範紀錄！請至儀表板或列表探索。');
  };

  const handleClearAll = () => {
    if (
      confirm(
        '⚠️ 警告：確定要清空所有資料嗎？此操作無法復原，請先確保已備份 JSON 檔案。'
      )
    ) {
      onSetRecords([]);
      onShowToast('已清空所有本機身心紀錄');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 pb-32 lg:pb-16 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          資料管理與系統說明
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          本機隱私保護、JSON/CSV 備份與匯入、以及 ERWS 身心紀錄鏈的設計理念。
        </p>
      </div>

      {/* Privacy Guarantee Card */}
      <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3.5">
        <ShieldCheck className="text-emerald-700 shrink-0 mt-0.5" size={22} />
        <div className="text-xs sm:text-sm space-y-1">
          <h3 className="font-bold text-stone-900">100% 本地儲存與極致隱私</h3>
          <p className="text-stone-600 leading-relaxed text-xs">
            ERWS 遵循「Local-First」原則，所有日記、心情、精力及自動想法均保存在您目前裝置的瀏覽器
            <code className="mx-1 px-1 bg-stone-200 rounded text-stone-800 font-mono">
              localStorage
            </code>
            中，絕不自動上傳任何遠端資料庫。請定期使用「下載 JSON 備份」保護您的歷史寶貴資產。
          </p>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Download size={18} />
          <span>資料匯出與備份</span>
        </h2>
        <p className="text-xs text-stone-500">
          目前本機共有 <strong className="text-stone-900 font-mono">{records.length}</strong> 筆身心紀錄。
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleExportJson}
            disabled={records.length === 0}
            className="py-2.5 px-4 rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-200 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-2 transition-all shadow-xs"
          >
            <Download size={15} />
            <span>下載完整 JSON 備份檔</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={records.length === 0}
            className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <Download size={15} />
            <span>匯出為 CSV 試算表</span>
          </button>
        </div>
      </div>

      {/* Data Import */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Upload size={18} />
          <span>還原與匯入資料</span>
        </h2>
        <p className="text-xs text-stone-500">
          自其他裝置或過往備份的 JSON 檔案載入紀錄。
        </p>

        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="importMode"
              checked={importMode === 'append'}
              onChange={() => setImportMode('append')}
              className="accent-stone-900"
            />
            <span>合併新舊資料（依 ID 自動去重）</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="importMode"
              checked={importMode === 'replace'}
              onChange={() => setImportMode('replace')}
              className="accent-stone-900"
            />
            <span>完全覆蓋現有資料</span>
          </label>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload-input"
        />
        <label
          htmlFor="file-upload-input"
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-800 bg-stone-50 hover:bg-stone-100 text-xs font-medium cursor-pointer transition-colors"
        >
          <Upload size={15} />
          <span>選取 JSON 檔案匯入</span>
        </label>
      </div>

      {/* Demo Data & Reset */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Database size={18} />
          <span>範例資料與重設</span>
        </h2>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleLoadSeedData}
            className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={15} />
            <span>載入 12 筆完整示範資料（涵蓋豐富情境）</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={records.length === 0}
            className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <Trash2 size={15} />
            <span>清空所有本機資料</span>
          </button>
        </div>
      </div>

      {/* Philosophy & Principles */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Info size={18} />
          <span>ERWS 產品設計核心原則</span>
        </h2>
        <div className="text-xs sm:text-sm text-stone-600 space-y-2.5 leading-relaxed">
          <p>
            <strong>不是診斷工具：</strong>
            ERWS 定位為「降低記錄門檻、提升自我觀察品質、保留原始真實資料、協助發現長期規律」的輔助系統。它絕不會向使用者宣稱「你有什麼心理病」或強加價值觀。
          </p>
          <p>
            <strong>心情與精力必須分開：</strong>
            一個人可以心情愉悅但體力嚴重虛脫，也可以精力充沛但思緒焦慮。將兩者混為一談會讓人忽略身體的真實警訊。
          </p>
          <p>
            <strong>認知檢視非盲目正向：</strong>
            我們檢驗自動想法，並不是為了強迫自己「開心起來」，而是尋求更客觀、更全面的事實依據（支持 vs 反對證據），讓情緒強度自然鬆動。
          </p>
        </div>
      </div>
    </div>
  );
};
