import React, { useState } from 'react';
import { ERWSRecord, EventCategory } from '../types/erws';
import { EVENT_CATEGORIES } from '../constants/emotions';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  ChevronRight,
  Sparkles,
  X,
  Smile,
  BatteryCharging,
  Eye,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface RecordsListViewProps {
  records: ERWSRecord[];
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: ERWSRecord) => void;
  onUpdateRecord: (record: ERWSRecord) => void;
}

export const RecordsListView: React.FC<RecordsListViewProps> = ({
  records,
  onDeleteRecord,
  onEditRecord,
  onUpdateRecord,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | '7d' | '30d' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [overwhelmedOnly, setOverwhelmedOnly] = useState(false);

  // Modal for Viewing Detail
  const [detailRecord, setDetailRecord] = useState<ERWSRecord | null>(null);

  // In-app Delete Confirmation (replaces blocked browser confirm dialog)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Modal or inline input for Psychological Distance Re-evaluation
  const [reEvalRecordId, setReEvalRecordId] = useState<string | null>(null);
  const [reEvalValue, setReEvalValue] = useState<number>(2.5);

  // Filtering logic
  const now = new Date();
  const filtered = records.filter((r) => {
    // Search text
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      const matchEvent = r.event?.toLowerCase().includes(q);
      const matchThought = r.thought?.toLowerCase().includes(q);
      const matchEmotions = r.emotions?.some((e) => e.toLowerCase().includes(q));
      const matchAlt = r.alternativeThought?.toLowerCase().includes(q);
      if (!matchEvent && !matchThought && !matchEmotions && !matchAlt) {
        return false;
      }
    }

    // Category
    if (selectedCategory !== 'all' && r.eventCategory !== selectedCategory) {
      return false;
    }

    // Overwhelmed
    if (overwhelmedOnly && !r.overwhelmed) {
      return false;
    }

    // Time filter
    if (timeFilter === '7d') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      if (r.date < d.toISOString().slice(0, 10)) return false;
    } else if (timeFilter === '30d') {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      if (r.date < d.toISOString().slice(0, 10)) return false;
    } else if (timeFilter === 'custom') {
      if (customStart && r.date < customStart) return false;
      if (customEnd && r.date > customEnd) return false;
    }

    return true;
  });

  // Sort descending by timestamp
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleSaveReEvaluation = (record: ERWSRecord) => {
    const updated: ERWSRecord = {
      ...record,
      reEvaluatedImportance: reEvalValue,
      reEvaluatedDate: new Date().toISOString().slice(0, 10),
    };
    onUpdateRecord(updated);
    setReEvalRecordId(null);
    if (detailRecord && detailRecord.id === record.id) {
      setDetailRecord(updated);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 pb-32 lg:pb-16 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          紀錄總覽與時間軸
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          檢索歷史身心紀錄，檢視認知歷程，或對過往重要事件進行隔期心理距離重新評估。
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3">
        {/* Search input and category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜尋事件、想法、情緒關鍵字..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none"
            >
              <option value="all">所有事件類型</option>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time filters & Overwhelmed pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-stone-500 font-medium">時間範圍:</span>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                timeFilter === 'all'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setTimeFilter('7d')}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                timeFilter === '7d'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              最近 7 天
            </button>
            <button
              onClick={() => setTimeFilter('30d')}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                timeFilter === '30d'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              最近 30 天
            </button>
            <button
              onClick={() => setTimeFilter('custom')}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                timeFilter === 'custom'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              自訂區間
            </button>
          </div>

          <button
            onClick={() => setOverwhelmedOnly(!overwhelmedOnly)}
            className={`px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
              overwhelmedOnly
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            {overwhelmedOnly ? '✓ 僅看 Overwhelmed 崩潰紀錄' : '篩選崩潰狀態'}
          </button>
        </div>

        {timeFilter === 'custom' && (
          <div className="flex items-center gap-2 pt-2 text-xs">
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

      {/* Record Counter */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-mono px-1">
        <span>顯示 {sorted.length} / {records.length} 筆紀錄</span>
      </div>

      {/* Record Cards List */}
      {sorted.length > 0 ? (
        <div className="space-y-4">
          {sorted.map((rec) => {
            const hasReEvaluated = rec.reEvaluatedImportance !== undefined;
            const diffImportance =
              hasReEvaluated && rec.importance !== undefined
                ? Math.round((rec.reEvaluatedImportance! - rec.importance) * 10) / 10
                : null;

            return (
              <div
                key={rec.id}
                className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-stone-300 transition-all space-y-3"
              >
                {/* Header row: date/time, category, overwhelmed badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">{rec.date}</span>
                    <span className="font-mono text-stone-400">{rec.time}</span>
                    {rec.eventCategory && (
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                        {rec.eventCategory}
                      </span>
                    )}
                    {rec.overwhelmed && (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold animate-pulse">
                        Overwhelmed 崩潰
                      </span>
                    )}
                  </div>

                  {/* Right side: Mood & Energy */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Smile size={13} className="text-stone-500" />
                      <span className="font-mono font-bold text-stone-900">{rec.mood}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BatteryCharging size={13} className="text-amber-600" />
                      <span className="font-mono font-bold text-amber-700">{rec.energy}</span>
                    </div>
                  </div>
                </div>

                {/* Event & Thought */}
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 leading-snug font-mincho">
                    {rec.event || '未輸入具體事件'}
                  </h3>
                  {rec.thought && (
                    <p className="text-xs text-stone-700 mt-1 italic line-clamp-2 font-mincho">
                      「{rec.thought}」
                    </p>
                  )}
                </div>

                {/* Emotion chips */}
                {rec.emotions && rec.emotions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {rec.emotions.map((e, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200/60 font-medium"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                )}

                {/* Psychological distance decay badge if re-evaluated */}
                {hasReEvaluated && (
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500">心理距離評估：</span>
                      <span className="font-mono">
                        當下重要性 {rec.importance} → 再次評估 {rec.reEvaluatedImportance}
                      </span>
                    </div>
                    {diffImportance !== null && (
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          diffImportance < 0
                            ? 'text-emerald-700 bg-emerald-100'
                            : 'text-stone-700 bg-stone-200'
                        }`}
                      >
                        {diffImportance < 0 ? `降溫 ${Math.abs(diffImportance)} 分` : `變化 +${diffImportance}`}
                      </span>
                    )}
                  </div>
                )}

                {/* Inline Re-eval form if toggled */}
                {reEvalRecordId === rec.id && (
                  <div className="p-3 bg-stone-100 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center font-medium">
                      <span>後續再次評估此事件重要性 (1-5)：</span>
                      <span className="font-mono font-bold">{reEvalValue.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.5"
                      value={reEvalValue}
                      onChange={(e) => setReEvalValue(parseFloat(e.target.value))}
                      className="w-full accent-stone-900"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setReEvalRecordId(null)}
                        className="px-3 py-1 rounded bg-stone-200 text-stone-700 hover:bg-stone-300"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleSaveReEvaluation(rec)}
                        className="px-3 py-1 rounded bg-stone-900 text-white font-medium hover:bg-stone-800"
                      >
                        儲存評估
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Action Row */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailRecord(rec)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Eye size={13} />
                      <span>查看完整鏈結</span>
                    </button>
                    <button
                      onClick={() => {
                        setReEvalRecordId(rec.id);
                        setReEvalValue(rec.reEvaluatedImportance ?? rec.importance ?? 2.5);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw size={13} />
                      <span>隔期心理距離評估</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditRecord(rec)}
                      className="p-1.5 text-stone-400 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors"
                      title="編輯紀錄"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(rec.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="刪除紀錄"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-2xl border border-stone-200 text-stone-400 space-y-2">
          <p className="text-sm font-medium">沒有符合條件的紀錄</p>
          <p className="text-xs">試著調整篩選條件或關鍵字，或新增一筆新紀錄。</p>
        </div>
      )}

      {/* In-app Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  確定要刪除這筆身心紀錄？
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  此動作無法復原，本機紀錄將被永久移除。
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-200 text-stone-700 text-xs font-medium hover:bg-stone-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmDeleteId) {
                    onDeleteRecord(confirmDeleteId);
                    if (detailRecord && detailRecord.id === confirmDeleteId) {
                      setDetailRecord(null);
                    }
                    setConfirmDeleteId(null);
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 shadow-xs"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Detail Modal */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs font-mono text-stone-400">
                  {detailRecord.date} {detailRecord.time}
                </span>
                <h2 className="text-lg font-bold text-stone-900">
                  完整身心認知鏈結檢視
                </h2>
              </div>
              <button
                onClick={() => setDetailRecord(null)}
                className="p-2 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Core indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-[11px] text-stone-500">心情指數</span>
                <div className="text-xl font-bold font-mono text-stone-900">{detailRecord.mood}</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-[11px] text-stone-500">精力值</span>
                <div className="text-xl font-bold font-mono text-amber-600">{detailRecord.energy}</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-[11px] text-stone-500">目標感</span>
                <div className="text-xl font-bold font-mono text-stone-900">{detailRecord.goalSense ?? '—'}</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-[11px] text-stone-500">完成感</span>
                <div className="text-xl font-bold font-mono text-stone-900">{detailRecord.completionSense ?? '—'}</div>
              </div>
            </div>

            {/* Event & Thought */}
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="font-semibold text-stone-900">事件／情境：</div>
              <div className="p-3 bg-stone-50 rounded-xl text-stone-800 font-mincho">
                {detailRecord.event || '未記錄'}
              </div>

              <div className="font-semibold text-stone-900 pt-2">當下自動想法：</div>
              <div className="p-3 bg-stone-50 rounded-xl text-stone-800 italic font-mincho">
                「{detailRecord.thought || '未記錄'}」
              </div>

              {detailRecord.thoughtMeaning && (
                <div className="text-xs text-stone-600">
                  <strong>想法底層意涵：</strong>{' '}
                  <span className="font-mincho">{detailRecord.thoughtMeaning}</span>
                </div>
              )}
            </div>

            {/* Cognitive Examination details if present */}
            {(detailRecord.evidenceFor || detailRecord.evidenceAgainst || detailRecord.alternativeThought) && (
              <div className="p-4 bg-stone-50 rounded-xl space-y-3 text-xs sm:text-sm border border-stone-200">
                <h4 className="font-bold text-stone-900">認知檢視與客觀事實</h4>
                {detailRecord.belief !== undefined && (
                  <div className="text-xs font-mono">
                    原始可信度：<strong>{detailRecord.belief}%</strong>
                    {detailRecord.reBelief !== undefined && (
                      <span className="ml-3 text-emerald-700">
                        重新思考後可信度：<strong>{detailRecord.reBelief}%</strong>
                      </span>
                    )}
                  </div>
                )}
                {detailRecord.evidenceFor && (
                  <div>
                    <span className="font-semibold text-stone-700">支持證據：</span>
                    <p className="text-stone-700 mt-0.5 font-mincho">{detailRecord.evidenceFor}</p>
                  </div>
                )}
                {detailRecord.evidenceAgainst && (
                  <div>
                    <span className="font-semibold text-stone-700">反證（不支持證據）：</span>
                    <p className="text-stone-700 mt-0.5 font-mincho">{detailRecord.evidenceAgainst}</p>
                  </div>
                )}
                {detailRecord.alternativeThought && (
                  <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                    <span className="font-semibold text-stone-900">替代性合理解釋：</span>
                    <p className="text-stone-900 mt-0.5 font-mincho">{detailRecord.alternativeThought}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions and Outcomes */}
            {(detailRecord.actualAction || detailRecord.actionOutcome) && (
              <div className="space-y-2 text-xs sm:text-sm">
                <h4 className="font-bold text-stone-900">實際調節行動與結果</h4>
                <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                  <div>
                    <strong>採取行動：</strong>{' '}
                    <span className="font-mincho">{detailRecord.actualAction || '未記錄'}</span>
                  </div>
                  <div>
                    <strong>行動後結果：</strong>{' '}
                    <span className="font-mincho">{detailRecord.actionOutcome || '未記錄'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(detailRecord.id)}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} />
                <span>刪除此紀錄</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const rec = detailRecord;
                    setDetailRecord(null);
                    onEditRecord(rec);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800"
                >
                  編輯此紀錄
                </button>
                <button
                  onClick={() => setDetailRecord(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-medium hover:bg-stone-50"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
