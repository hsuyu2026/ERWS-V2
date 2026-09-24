import React, { useState } from 'react';
import { ERWSRecord, EventCategory, ViewMode } from '../types/erws';
import {
  CORE_EMOTION_GROUPS,
  EVENT_CATEGORIES,
  MIND_BODY_ITEMS,
  NEEDS_INTENTION_ITEMS,
} from '../constants/emotions';
import {
  getCustomBodyStates,
  saveCustomBodyState,
  removeCustomBodyState,
} from '../utils/storage';
import {
  Zap,
  Clock,
  BatteryCharging,
  Smile,
  ChevronDown,
  ChevronUp,
  Brain,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface QuickRecordViewProps {
  onSaveRecord: (record: ERWSRecord) => void;
  onNavigate: (view: ViewMode) => void;
  recentRecords: ERWSRecord[];
}

export const QuickRecordView: React.FC<QuickRecordViewProps> = ({
  onSaveRecord,
  onNavigate,
  recentRecords,
}) => {
  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const defaultTime = now.toTimeString().slice(0, 5);

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [mood, setMood] = useState<number>(3.5);
  const [energy, setEnergy] = useState<number>(3.0);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [selectedBodyStates, setSelectedBodyStates] = useState<string[]>([]);
  const [customBodyStates, setCustomBodyStates] = useState<string[]>(() =>
    getCustomBodyStates()
  );
  const [newBodyStateInput, setNewBodyStateInput] = useState('');
  const [isAddingCustomBody, setIsAddingCustomBody] = useState(false);
  const [overwhelmed, setOverwhelmed] = useState<boolean>(false);
  const [eventCategory, setEventCategory] = useState<EventCategory>('工作');
  const [event, setEvent] = useState('');
  const [thought, setThought] = useState('');

  // Optional lightweight advanced fields expandable in-place
  const [showAdvancedInPlace, setShowAdvancedInPlace] = useState(false);
  const [beforeMood, setBeforeMood] = useState<number | undefined>(undefined);
  const [afterMood, setAfterMood] = useState<number | undefined>(undefined);
  const [goalSense, setGoalSense] = useState<number | undefined>(undefined);
  const [completionSense, setCompletionSense] = useState<number | undefined>(undefined);
  const [importance, setImportance] = useState<number | undefined>(undefined);

  // Auto detection for low mood or repeated event
  const isLowMoodOrOverwhelmed = mood <= 2.5 || overwhelmed;
  const sameEventRecentCount = event.trim()
    ? recentRecords.filter((r) =>
        r.event &&
        (r.event.includes(event.trim()) || event.trim().includes(r.event))
      ).length
    : 0;

  const toggleEmotion = (item: string) => {
    if (selectedEmotions.includes(item)) {
      setSelectedEmotions(selectedEmotions.filter((e) => e !== item));
    } else {
      setSelectedEmotions([...selectedEmotions, item]);
    }
  };

  const toggleNeed = (item: string) => {
    if (selectedNeeds.includes(item)) {
      setSelectedNeeds(selectedNeeds.filter((n) => n !== item));
    } else {
      setSelectedNeeds([...selectedNeeds, item]);
    }
  };

  const toggleBodyState = (item: string) => {
    if (selectedBodyStates.includes(item)) {
      setSelectedBodyStates(selectedBodyStates.filter((b) => b !== item));
    } else {
      setSelectedBodyStates([...selectedBodyStates, item]);
    }
  };

  const handleAddCustomBodyState = () => {
    const trimmed = newBodyStateInput.trim();
    if (!trimmed) return;
    const updated = saveCustomBodyState(trimmed);
    setCustomBodyStates(updated);
    if (!selectedBodyStates.includes(trimmed)) {
      setSelectedBodyStates([...selectedBodyStates, trimmed]);
    }
    setNewBodyStateInput('');
    setIsAddingCustomBody(false);
  };

  const handleRemoveCustomBodyState = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeCustomBodyState(item);
    setCustomBodyStates(updated);
    setSelectedBodyStates(selectedBodyStates.filter((b) => b !== item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date(`${date}T${time}:00`).toISOString();
    const newRecord: ERWSRecord = {
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp,
      date,
      time,
      mood,
      energy,
      emotions: selectedEmotions,
      cognitiveStates: [],
      needs: selectedNeeds,
      bodyStates: selectedBodyStates,
      overwhelmed,
      eventCategory,
      event: event.trim(),
      thought: thought.trim(),
      beforeMood,
      afterMood,
      goalSense,
      completionSense,
      importance,
    };

    onSaveRecord(newRecord);
    // Reset form for next entry
    setThought('');
    setEvent('');
    setSelectedEmotions([]);
    setSelectedNeeds([]);
    setSelectedBodyStates([]);
    setOverwhelmed(false);
  };

  const moodLabels: Record<number, string> = {
    1.0: '1.0 極低沉／痛苦',
    1.5: '1.5 相當低落',
    2.0: '2.0 低落／沉重',
    2.5: '2.5 偏低／微悶',
    3.0: '3.0 中性／平靜',
    3.5: '3.5 尚可／微晴',
    4.0: '4.0 愉悅／不錯',
    4.5: '4.5 相當振奮',
    5.0: '5.0 最佳／充沛',
  };

  const energyLabels: Record<number, string> = {
    1.0: '1.0 精疲力竭 (耗盡)',
    1.5: '1.5 嚴重虛耗',
    2.0: '2.0 疲憊沉重',
    2.5: '2.5 偏累無力',
    3.0: '3.0 普通平穩',
    3.5: '3.5 尚有餘力',
    4.0: '4.0 精力充沛',
    4.5: '4.5 活力旺盛',
    5.0: '5.0 巔峰滿電',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 pb-28 lg:pb-12">
      {/* Header section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
          <Zap size={14} />
          <span>Rapid Check-In · 30秒紀錄</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          快速身心狀態紀錄
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          紀錄當下的心情與精力。分開兩者能幫助你看見「心情雖好但體力耗盡」或「體力充足但焦慮」的真實狀態。
        </p>
      </div>

      {/* Smart Hint Banner if Low Mood or Overwhelmed or Repeated Event */}
      {(isLowMoodOrOverwhelmed || sameEventRecentCount >= 2) && (
        <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-amber-900">
                {overwhelmed
                  ? '系統偵測到目前處於 Overwhelmed（崩潰狀態）'
                  : mood <= 2.5
                  ? '偵測到心情指數偏低（≤ 2.5）'
                  : '近期偵測到類似事件反覆出現'}
              </p>
              <p className="text-amber-800 text-xs mt-0.5">
                建議可以給自己一些呼吸空間，或切換至【深入紀錄】進行客觀認知檢視。
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('deep-record')}
            className="self-start sm:self-auto px-3 py-1.5 bg-amber-700 text-white font-medium rounded-lg hover:bg-amber-800 transition-colors flex items-center gap-1.5 text-xs shrink-0"
          >
            <span>切換為深入紀錄</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date & Time Row */}
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Clock size={13} className="text-stone-400" />
              <span>日期</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Clock size={13} className="text-stone-400" />
              <span>時間</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
            />
          </div>
        </div>

        {/* Mood & Energy: Crucial 0.5 step separation */}
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-6">
          {/* Mood Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <Smile size={15} className="text-stone-700" />
                <span>心情指數 (Mood)</span>
              </span>
              <span className="text-sm font-bold font-mono text-stone-900 px-2 py-0.5 bg-stone-100 rounded">
                {moodLabels[mood] || `${mood.toFixed(1)} / 5.0`}
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={mood}
              onChange={(e) => setMood(parseFloat(e.target.value))}
              className="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1 font-mono">
              <span>1.0 痛苦低沉</span>
              <span>2.5 偏悶</span>
              <span>3.0 平靜</span>
              <span>4.0 愉快</span>
              <span>5.0 充沛喜悅</span>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-5">
            {/* Energy Slider */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <BatteryCharging size={15} className="text-amber-600" />
                <span>精力值 (Energy)</span>
              </span>
              <span className="text-sm font-bold font-mono text-amber-700 px-2 py-0.5 bg-amber-50 rounded border border-amber-100">
                {energyLabels[energy] || `${energy.toFixed(1)} / 5.0`}
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={energy}
              onChange={(e) => setEnergy(parseFloat(e.target.value))}
              className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1 font-mono">
              <span>1.0 虛脫耗盡</span>
              <span>2.5 偏累</span>
              <span>3.0 平穩</span>
              <span>4.0 充沛</span>
              <span>5.0 滿電</span>
            </div>
          </div>
        </div>

        {/* Overwhelmed State Toggle Button */}
        <div
          onClick={() => setOverwhelmed(!overwhelmed)}
          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
            overwhelmed
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
              : 'bg-stone-50/60 border-stone-200 hover:bg-stone-100/60'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  overwhelmed ? 'bg-rose-600 animate-pulse' : 'bg-stone-300'
                }`}
              ></span>
              <span className="text-sm font-semibold text-stone-900">
                Overwhelmed（崩潰／失控感狀態）
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              若當下感到情緒強度過高、難以負荷或瀕臨失控，可標記此獨立狀態。
            </p>
          </div>
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              overwhelmed
                ? 'bg-rose-600 text-white'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            {overwhelmed ? '已標記崩潰' : '未處於崩潰'}
          </button>
        </div>

        {/* Emotion Taxonomy Group Selector */}
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-900">
              情緒標籤（可多選）
            </label>
            <span className="text-xs text-stone-400">
              已選 {selectedEmotions.length} 個
            </span>
          </div>

          <div className="space-y-4">
            {CORE_EMOTION_GROUPS.map((group) => (
              <div key={group.id} className="space-y-1.5">
                <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      group.colorTag === 'red'
                        ? 'bg-rose-500'
                        : group.colorTag === 'orange'
                        ? 'bg-amber-500'
                        : group.colorTag === 'blue'
                        ? 'bg-sky-500'
                        : 'bg-emerald-500'
                    }`}
                  ></span>
                  <span>{group.categoryName}</span>
                  {group.subCategoryName && (
                    <span className="text-stone-400">· {group.subCategoryName}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => {
                    const isSelected = selectedEmotions.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleEmotion(item)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all min-h-[36px] ${
                          isSelected
                            ? group.activeClass + ' font-medium shadow-xs'
                            : 'bg-stone-50/80 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs & Body States Pills */}
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div>
            <div className="text-xs font-semibold text-stone-800 mb-2">
              當下需求與調節傾向（Needs）
            </div>
            <div className="flex flex-wrap gap-1.5">
              {NEEDS_INTENTION_ITEMS.map((item) => {
                const isSelected = selectedNeeds.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleNeed(item)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all min-h-[36px] ${
                      isSelected
                        ? 'bg-teal-700 text-white border-teal-700 font-medium'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-stone-800">
                身心與生理狀態（Mind-Body）
              </div>
              <button
                type="button"
                onClick={() => setIsAddingCustomBody(!isAddingCustomBody)}
                className="text-[11px] text-stone-500 hover:text-stone-900 font-medium underline"
              >
                {isAddingCustomBody ? '收起自訂' : '＋ 自訂選項'}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {MIND_BODY_ITEMS.map((item) => {
                const isSelected = selectedBodyStates.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleBodyState(item)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all min-h-[36px] ${
                      isSelected
                        ? 'bg-stone-800 text-white border-stone-800 font-medium'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}

              {/* Custom Mind-Body Items entered by user */}
              {customBodyStates
                .filter((c) => !MIND_BODY_ITEMS.includes(c))
                .map((item) => {
                  const isSelected = selectedBodyStates.includes(item);
                  return (
                    <div
                      key={item}
                      className={`inline-flex items-center text-xs rounded-lg border transition-all min-h-[36px] overflow-hidden ${
                        isSelected
                          ? 'bg-stone-800 text-white border-stone-800 font-medium'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleBodyState(item)}
                        className="px-2.5 py-1.5"
                      >
                        {item}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveCustomBodyState(item, e)}
                        className={`px-1.5 py-1.5 opacity-60 hover:opacity-100 ${
                          isSelected ? 'hover:bg-stone-700' : 'hover:bg-stone-200'
                        }`}
                        title="移除此自訂標籤"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Custom Mind-Body Input Row */}
            {(isAddingCustomBody || customBodyStates.length === 0) && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newBodyStateInput}
                  onChange={(e) => setNewBodyStateInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomBodyState();
                    }
                  }}
                  placeholder="輸入自訂身心狀態（例：肩頸僵硬、偏頭痛、胸悶...）"
                  className="text-xs px-3 py-1.5 border border-stone-200 rounded-lg bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 flex-1 max-w-sm"
                />
                <button
                  type="button"
                  onClick={handleAddCustomBodyState}
                  disabled={!newBodyStateInput.trim()}
                  className="text-xs px-3 py-1.5 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  新增
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Event & Thought Input */}
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              事件類型
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setEventCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all min-h-[36px] ${
                    eventCategory === cat
                      ? 'bg-stone-900 text-white border-stone-900 font-medium'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              事件／情境（發生了什麼事？）
            </label>
            <input
              type="text"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="例：開會檢討專案、收到客戶郵件、下班通勤..."
              className="w-full text-sm px-3.5 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 font-mincho"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              當下想法（腦海中浮現的第一句話）
            </label>
            <textarea
              rows={2}
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="例：是不是我又哪裡做錯了？大家都在看我..."
              className="w-full text-sm px-3.5 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none font-mincho"
            />
          </div>
        </div>

        {/* In-place Advanced Options Accordion */}
        <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvancedInPlace(!showAdvancedInPlace)}
            className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-medium text-stone-600 hover:bg-stone-50 min-h-[44px]"
          >
            <span>
              {showAdvancedInPlace
                ? '收起進階欄位（事件前後／目標完成感）'
                : '＋ 展開快速進階欄位（選填：事件前後心情、目標感）'}
            </span>
            {showAdvancedInPlace ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAdvancedInPlace && (
            <div className="p-4 border-t border-stone-100 bg-stone-50/40 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Before Mood Slider */}
                <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700">
                      事件前心情
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        beforeMood !== undefined
                          ? 'bg-stone-100 text-stone-900 border border-stone-200'
                          : 'bg-stone-50 text-stone-400'
                      }`}>
                        {beforeMood !== undefined ? `${beforeMood.toFixed(1)} / 5.0` : '未設定'}
                      </span>
                      {beforeMood !== undefined && (
                        <button
                          type="button"
                          onClick={() => setBeforeMood(undefined)}
                          className="text-[10px] text-stone-400 hover:text-stone-700 hover:underline"
                        >
                          清除
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.5"
                    value={beforeMood ?? 3.0}
                    onChange={(e) => setBeforeMood(parseFloat(e.target.value))}
                    className="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>1.0 低沉</span>
                    <span>3.0 平靜</span>
                    <span>5.0 振奮</span>
                  </div>
                </div>

                {/* After Mood Slider */}
                <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700">
                      事件後心情
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        afterMood !== undefined
                          ? 'bg-stone-100 text-stone-900 border border-stone-200'
                          : 'bg-stone-50 text-stone-400'
                      }`}>
                        {afterMood !== undefined ? `${afterMood.toFixed(1)} / 5.0` : '未設定'}
                      </span>
                      {afterMood !== undefined && (
                        <button
                          type="button"
                          onClick={() => setAfterMood(undefined)}
                          className="text-[10px] text-stone-400 hover:text-stone-700 hover:underline"
                        >
                          清除
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.5"
                    value={afterMood ?? 3.0}
                    onChange={(e) => setAfterMood(parseFloat(e.target.value))}
                    className="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>1.0 低沉</span>
                    <span>3.0 平靜</span>
                    <span>5.0 振奮</span>
                  </div>
                </div>

                {/* Goal Sense Slider */}
                <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700">
                      今日目標感
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        goalSense !== undefined
                          ? 'bg-stone-100 text-stone-900 border border-stone-200'
                          : 'bg-stone-50 text-stone-400'
                      }`}>
                        {goalSense !== undefined ? `${goalSense.toFixed(1)} / 5.0` : '未設定'}
                      </span>
                      {goalSense !== undefined && (
                        <button
                          type="button"
                          onClick={() => setGoalSense(undefined)}
                          className="text-[10px] text-stone-400 hover:text-stone-700 hover:underline"
                        >
                          清除
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.5"
                    value={goalSense ?? 3.0}
                    onChange={(e) => setGoalSense(parseFloat(e.target.value))}
                    className="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>1.0 茫然</span>
                    <span>3.0 明確</span>
                    <span>5.0 極清晰</span>
                  </div>
                </div>

                {/* Completion Sense Slider */}
                <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700">
                      今日完成感
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        completionSense !== undefined
                          ? 'bg-stone-100 text-stone-900 border border-stone-200'
                          : 'bg-stone-50 text-stone-400'
                      }`}>
                        {completionSense !== undefined ? `${completionSense.toFixed(1)} / 5.0` : '未設定'}
                      </span>
                      {completionSense !== undefined && (
                        <button
                          type="button"
                          onClick={() => setCompletionSense(undefined)}
                          className="text-[10px] text-stone-400 hover:text-stone-700 hover:underline"
                        >
                          清除
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.5"
                    value={completionSense ?? 3.0}
                    onChange={(e) => setCompletionSense(parseFloat(e.target.value))}
                    className="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>1.0 未完成</span>
                    <span>3.0 大致完成</span>
                    <span>5.0 超出預期</span>
                  </div>
                </div>
              </div>

              {/* Helpful delta indicator if before & after mood both set */}
              {beforeMood !== undefined && afterMood !== undefined && (
                <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-stone-200 text-xs">
                  <span className="text-stone-600">事件前後心情變化：</span>
                  <span className={`font-mono font-bold ${
                    afterMood > beforeMood
                      ? 'text-emerald-700'
                      : afterMood < beforeMood
                      ? 'text-rose-700'
                      : 'text-stone-700'
                  }`}>
                    {afterMood > beforeMood ? '+' : ''}
                    {(afterMood - beforeMood).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 py-3 px-6 rounded-xl bg-stone-900 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-md active:scale-[0.99] min-h-[48px]"
          >
            <Zap size={16} className="fill-white" />
            <span>完成並儲存快速紀錄</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('deep-record')}
            className="py-3 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
          >
            <Brain size={15} />
            <span>轉至深入檢視</span>
          </button>
        </div>
      </form>
    </div>
  );
};
