import React, { useState } from 'react';
import { ERWSRecord } from '../types/erws';
import {
  buildAiExportPrompt,
  ANALYSIS_OBJECTIVE_OPTIONS,
  FOCUS_AREAS,
} from '../utils/aiPromptFormatter';
import {
  Sparkles,
  Copy,
  Check,
  Calendar,
  Layers,
  HelpCircle,
  FileText,
  Sliders,
} from 'lucide-react';

interface AiExportViewProps {
  records: ERWSRecord[];
  onShowToast: (msg: string) => void;
}

export const AiExportView: React.FC<AiExportViewProps> = ({
  records,
  onShowToast,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all' | 'custom'>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string[]>([
    '情緒波動',
    '精力變化',
    '認知模式',
    '社交影響',
    '身心狀態',
  ]);
  const [selectedObjective, setSelectedObjective] = useState<string>(
    ANALYSIS_OBJECTIVE_OPTIONS[0].id
  );
  const [copied, setCopied] = useState(false);

  // Filter records by time
  const now = new Date();
  const filteredRecords = records.filter((r) => {
    if (timeRange === '7d') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return r.date >= d.toISOString().slice(0, 10);
    } else if (timeRange === '14d') {
      const d = new Date(now);
      d.setDate(d.getDate() - 14);
      return r.date >= d.toISOString().slice(0, 10);
    } else if (timeRange === '30d') {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return r.date >= d.toISOString().slice(0, 10);
    } else if (timeRange === 'custom') {
      if (customStart && r.date < customStart) return false;
      if (customEnd && r.date > customEnd) return false;
      return true;
    }
    return true;
  });

  const toggleFocus = (area: string) => {
    if (selectedFocus.includes(area)) {
      setSelectedFocus(selectedFocus.filter((f) => f !== area));
    } else {
      setSelectedFocus([...selectedFocus, area]);
    }
  };

  const generatedPrompt = buildAiExportPrompt({
    records: filteredRecords,
    timeRange,
    customStart,
    customEnd,
    focusAreas: selectedFocus,
    objective: selectedObjective,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      onShowToast('已成功複製高品質分析 Prompt！可直接貼至 ChatGPT 或 Claude。');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      onShowToast('複製失敗，請手動全選複製');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 pb-32 lg:pb-16 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
          <Sparkles size={14} />
          <span>External AI Integration · 零隱私外洩架構</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          一鍵匯出 AI 分析 Prompt
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed max-w-3xl">
          本網站所有紀錄均保存在您的瀏覽器中，不向任何第三方伺服器傳送。
          當您需要深度分析時，可透過此功能將數據自動格式化並加上經過專業心理學原則微調的 Prompt，複製後自由貼入 ChatGPT、Claude 等大語言模型中對話。
        </p>
      </div>

      {/* Configuration Controls */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-6">
        {/* 1. Time Range */}
        <div>
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar size={14} />
            <span>一、選擇分析時間範圍</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: '7d', label: '最近 7 天' },
              { id: '14d', label: '最近 14 天' },
              { id: '30d', label: '最近 30 天' },
              { id: 'all', label: '全部紀錄' },
              { id: 'custom', label: '自訂日期區間' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  timeRange === t.id
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {timeRange === 'custom' && (
            <div className="flex items-center gap-2 pt-3 text-xs">
              <span>從:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2 py-1 border border-stone-200 rounded"
              />
              <span>至:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2 py-1 border border-stone-200 rounded"
              />
            </div>
          )}
        </div>

        {/* 2. Focus Areas */}
        <div className="border-t border-stone-100 pt-4">
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers size={14} />
            <span>二、匯出資料重點（可多選）</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFocus(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  selectedFocus.includes(f)
                    ? 'bg-stone-900 text-white border-stone-900 font-bold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {selectedFocus.includes(f) ? `✓ ${f}` : f}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Analysis Objective */}
        <div className="border-t border-stone-100 pt-4">
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sliders size={14} />
            <span>三、本次對話分析目的</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ANALYSIS_OBJECTIVE_OPTIONS.map((obj) => (
              <button
                key={obj.id}
                type="button"
                onClick={() => setSelectedObjective(obj.id)}
                className={`p-3 text-left rounded-xl border transition-all ${
                  selectedObjective === obj.id
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="font-bold text-xs">{obj.label}</div>
                <div
                  className={`text-[11px] mt-0.5 ${
                    selectedObjective === obj.id ? 'text-stone-300' : 'text-stone-500'
                  }`}
                >
                  {obj.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Prompt Preview & Copy Button */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <FileText size={18} />
              <span>Prompt 預覽（共包含 {filteredRecords.length} 筆身心紀錄）</span>
            </h2>
            <p className="text-xs text-stone-500">
              包含專為避免武斷診斷、著重模式辨識與同理提問而設計的高階指示詞。
            </p>
          </div>

          <button
            onClick={handleCopy}
            disabled={filteredRecords.length === 0}
            className="py-2.5 px-5 bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 shrink-0 min-h-[42px]"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-400" />
                <span>已複製到剪貼簿</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>一鍵複製 Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Textarea Preview */}
        <div className="relative">
          <textarea
            readOnly
            value={generatedPrompt}
            rows={14}
            className="w-full text-xs font-mono p-4 bg-stone-900 text-stone-100 rounded-xl border border-stone-800 leading-relaxed focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
};
