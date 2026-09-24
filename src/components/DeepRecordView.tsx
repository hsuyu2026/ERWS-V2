import React, { useState } from 'react';
import {
  ERWSRecord,
  EventCategory,
  GoalState,
  CompletionLevel,
  SocialFeeling,
  EvaluationConcern,
} from '../types/erws';
import {
  CORE_EMOTION_GROUPS,
  COGNITIVE_EVALUATION_ITEMS,
  NEEDS_INTENTION_ITEMS,
  MIND_BODY_ITEMS,
  EVENT_CATEGORIES,
  GOAL_STATES,
  COMPLETION_LEVELS,
  SOCIAL_FEELINGS,
  EVALUATION_CONCERNS,
  REGULATION_ACTION_SUGGESTIONS,
} from '../constants/emotions';
import {
  getCustomBodyStates,
  saveCustomBodyState,
  removeCustomBodyState,
} from '../utils/storage';
import { detectCognitivePatterns } from '../utils/cognitiveAnalysis';
import {
  Brain,
  Clock,
  Sparkles,
  HelpCircle,
  Users,
  Award,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface DeepRecordViewProps {
  onSaveRecord: (record: ERWSRecord) => void;
  initialRecord?: ERWSRecord | null;
  onCancel?: () => void;
}

export const DeepRecordView: React.FC<DeepRecordViewProps> = ({
  onSaveRecord,
  initialRecord,
  onCancel,
}) => {
  const now = new Date();
  const defaultDate = initialRecord?.date || now.toISOString().slice(0, 10);
  const defaultTime = initialRecord?.time || now.toTimeString().slice(0, 5);

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [mood, setMood] = useState<number>(initialRecord?.mood ?? 3.0);
  const [energy, setEnergy] = useState<number>(initialRecord?.energy ?? 3.0);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
    initialRecord?.emotions ?? []
  );
  const [selectedCognitiveStates, setSelectedCognitiveStates] = useState<string[]>(
    initialRecord?.cognitiveStates ?? []
  );
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(
    initialRecord?.needs ?? []
  );
  const [selectedBodyStates, setSelectedBodyStates] = useState<string[]>(
    initialRecord?.bodyStates ?? []
  );
  const [customBodyStates, setCustomBodyStates] = useState<string[]>(() =>
    getCustomBodyStates()
  );
  const [newBodyStateInput, setNewBodyStateInput] = useState('');
  const [isAddingCustomBody, setIsAddingCustomBody] = useState(false);
  const [overwhelmed, setOverwhelmed] = useState<boolean>(
    initialRecord?.overwhelmed ?? false
  );

  const [eventCategory, setEventCategory] = useState<EventCategory>(
    initialRecord?.eventCategory ?? '工作'
  );
  const [event, setEvent] = useState(initialRecord?.event ?? '');
  const [thought, setThought] = useState(initialRecord?.thought ?? '');
  const [thoughtMeaning, setThoughtMeaning] = useState(
    initialRecord?.thoughtMeaning ?? ''
  );

  // Cognitive deep dive
  const [belief, setBelief] = useState<number>(initialRecord?.belief ?? 75);
  const [evidenceFor, setEvidenceFor] = useState(initialRecord?.evidenceFor ?? '');
  const [evidenceAgainst, setEvidenceAgainst] = useState(
    initialRecord?.evidenceAgainst ?? ''
  );
  const [alternativeThought, setAlternativeThought] = useState(
    initialRecord?.alternativeThought ?? ''
  );
  const [reBelief, setReBelief] = useState<number>(initialRecord?.reBelief ?? 40);
  const [reEvaluatedIntensity, setReEvaluatedIntensity] = useState<number>(
    initialRecord?.reEvaluatedIntensity ?? 2.5
  );
  const [nextAction, setNextAction] = useState(initialRecord?.nextAction ?? '');

  // Before / After states
  const [beforeMood, setBeforeMood] = useState<number>(
    initialRecord?.beforeMood ?? 3.0
  );
  const [afterMood, setAfterMood] = useState<number>(
    initialRecord?.afterMood ?? 3.0
  );
  const [beforeEnergy, setBeforeEnergy] = useState<number>(
    initialRecord?.beforeEnergy ?? 3.0
  );
  const [afterEnergy, setAfterEnergy] = useState<number>(
    initialRecord?.afterEnergy ?? 3.0
  );

  // Goal & Completion
  const [goalSense, setGoalSense] = useState<number>(
    initialRecord?.goalSense ?? 3.0
  );
  const [completionSense, setCompletionSense] = useState<number>(
    initialRecord?.completionSense ?? 3.0
  );
  const [goalState, setGoalState] = useState<GoalState>(
    initialRecord?.goalState ?? '今天有想完成的事情'
  );
  const [completionLevel, setCompletionLevel] = useState<CompletionLevel>(
    initialRecord?.completionLevel ?? '大致完成'
  );

  // Social event expansion
  const [isSocialEvent, setIsSocialEvent] = useState<boolean>(
    initialRecord?.isSocialEvent ?? false
  );
  const [socialBeforeMood, setSocialBeforeMood] = useState<number>(
    initialRecord?.socialBeforeMood ?? 3.0
  );
  const [socialAfterMood, setSocialAfterMood] = useState<number>(
    initialRecord?.socialAfterMood ?? 3.5
  );
  const [socialBeforeEnergy, setSocialBeforeEnergy] = useState<number>(
    initialRecord?.socialBeforeEnergy ?? 3.0
  );
  const [socialAfterEnergy, setSocialAfterEnergy] = useState<number>(
    initialRecord?.socialAfterEnergy ?? 2.5
  );
  const [socialFeelings, setSocialFeelings] = useState<SocialFeeling[]>(
    initialRecord?.socialFeelings ?? []
  );

  // Evaluation impact expansion
  const [isEvaluationEvent, setIsEvaluationEvent] = useState<boolean>(
    initialRecord?.isEvaluationEvent ?? false
  );
  const [evaluationImpact, setEvaluationImpact] = useState<number>(
    initialRecord?.evaluationImpact ?? 3.5
  );
  const [evaluationConcern, setEvaluationConcern] = useState<EvaluationConcern>(
    initialRecord?.evaluationConcern ?? '他人怎麼看我'
  );
  const [evaluationConcernDetail, setEvaluationConcernDetail] = useState(
    initialRecord?.evaluationConcernDetail ?? ''
  );

  // Expectation vs Reality
  const [hasExpectationReality, setHasExpectationReality] = useState<boolean>(
    initialRecord?.hasExpectationReality ?? false
  );
  const [expectedMood, setExpectedMood] = useState<number>(
    initialRecord?.expectedMood ?? 2.5
  );
  const [expectedOutcome, setExpectedOutcome] = useState(
    initialRecord?.expectedOutcome ?? ''
  );
  const [actualMood, setActualMood] = useState<number>(
    initialRecord?.actualMood ?? 3.5
  );
  const [actualOutcome, setActualOutcome] = useState(
    initialRecord?.actualOutcome ?? ''
  );

  // Importance & Psychological Distance
  const [importance, setImportance] = useState<number>(
    initialRecord?.importance ?? 3.5
  );

  // Regulation action
  const [actualAction, setActualAction] = useState(
    initialRecord?.actualAction ?? ''
  );
  const [actionOutcome, setActionOutcome] = useState(
    initialRecord?.actionOutcome ?? ''
  );

  // Real-time Cognitive Patterns local heuristic
  const detectedPatterns = detectCognitivePatterns(thought);

  const toggleArrayItem = (
    arr: string[],
    setArr: (val: string[]) => void,
    item: string
  ) => {
    if (arr.includes(item)) {
      setArr(arr.filter((i) => i !== item));
    } else {
      setArr([...arr, item]);
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

  const toggleSocialFeeling = (item: SocialFeeling) => {
    if (socialFeelings.includes(item)) {
      setSocialFeelings(socialFeelings.filter((i) => i !== item));
    } else {
      setSocialFeelings([...socialFeelings, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp =
      initialRecord?.timestamp ||
      new Date(`${date}T${time}:00`).toISOString();

    const recordToSave: ERWSRecord = {
      id:
        initialRecord?.id ||
        'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp,
      date,
      time,
      mood,
      energy,
      emotions: selectedEmotions,
      cognitiveStates: selectedCognitiveStates,
      needs: selectedNeeds,
      bodyStates: selectedBodyStates,
      overwhelmed,
      eventCategory,
      event: event.trim(),
      thought: thought.trim(),
      thoughtMeaning: thoughtMeaning.trim(),
      belief,
      evidenceFor: evidenceFor.trim(),
      evidenceAgainst: evidenceAgainst.trim(),
      alternativeThought: alternativeThought.trim(),
      reBelief,
      reEvaluatedIntensity,
      nextAction: nextAction.trim(),
      beforeMood,
      afterMood,
      beforeEnergy,
      afterEnergy,
      goalSense,
      completionSense,
      goalState,
      completionLevel,
      isSocialEvent,
      socialBeforeMood: isSocialEvent ? socialBeforeMood : undefined,
      socialAfterMood: isSocialEvent ? socialAfterMood : undefined,
      socialBeforeEnergy: isSocialEvent ? socialBeforeEnergy : undefined,
      socialAfterEnergy: isSocialEvent ? socialAfterEnergy : undefined,
      socialFeelings: isSocialEvent ? socialFeelings : undefined,
      isEvaluationEvent,
      evaluationImpact: isEvaluationEvent ? evaluationImpact : undefined,
      evaluationConcern: isEvaluationEvent ? evaluationConcern : undefined,
      evaluationConcernDetail: isEvaluationEvent ? evaluationConcernDetail : undefined,
      hasExpectationReality,
      expectedMood: hasExpectationReality ? expectedMood : undefined,
      expectedOutcome: hasExpectationReality ? expectedOutcome.trim() : undefined,
      actualMood: hasExpectationReality ? actualMood : undefined,
      actualOutcome: hasExpectationReality ? actualOutcome.trim() : undefined,
      importance,
      reEvaluatedImportance: initialRecord?.reEvaluatedImportance,
      reEvaluatedDate: initialRecord?.reEvaluatedDate,
      actualAction: actualAction.trim(),
      actionOutcome: actionOutcome.trim(),
    };

    onSaveRecord(recordToSave);
  };

  // Deltas for display
  const moodDelta = Math.round((afterMood - beforeMood) * 10) / 10;
  const energyDelta = Math.round((afterEnergy - beforeEnergy) * 10) / 10;
  const beliefDelta = belief - reBelief;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 pb-32 lg:pb-16">
      {/* Process Breadcrumb Indicator */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
          <Brain size={14} />
          <span>Cognitive-Behavioral Framework · 深入紀錄鏈</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          認知取向深入身心檢視
        </h1>
        <div className="mt-3 py-2 px-3 bg-stone-100/80 rounded-xl text-[11px] sm:text-xs text-stone-600 flex flex-wrap items-center gap-1.5 font-medium">
          <span className="text-stone-900 font-semibold">完整紀錄鏈：</span>
          <span>事件情境</span>
          <span>→</span>
          <span>自動想法</span>
          <span>→</span>
          <span>身心與情緒</span>
          <span>→</span>
          <span>認知客觀檢視</span>
          <span>→</span>
          <span>調節行動</span>
          <span>→</span>
          <span>結果觀察</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: 基本與情境 */}
        <section className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-mono flex items-center justify-center font-semibold">
              1
            </span>
            <h2 className="text-base font-bold text-stone-900">事件與情境</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Calendar size={13} className="text-stone-400" />
                <span>日期</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg bg-stone-50/50"
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
                className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg bg-stone-50/50"
              />
            </div>
          </div>

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
              發生了什麼事？（具體客觀的人、事、時、地）
            </label>
            <textarea
              rows={2}
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              required
              placeholder="試著客觀描述當時的具體事實，例如：今天下午開會時主管詢問專案進度，並對預算分配提出疑問..."
              className="w-full text-sm px-3.5 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none font-mincho"
            />
          </div>

          {/* Current Mood & Energy Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-stone-800">
                  當下心情指數 (1-5)
                </span>
                <span className="text-sm font-bold font-mono text-stone-900 px-2 py-0.5 bg-stone-100 rounded">
                  {mood.toFixed(1)} / 5.0
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
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-stone-800">
                  當下精力值 (1-5)
                </span>
                <span className="text-sm font-bold font-mono text-amber-700 px-2 py-0.5 bg-amber-50 rounded border border-amber-100">
                  {energy.toFixed(1)} / 5.0
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
            </div>
          </div>
        </section>

        {/* Step 2: 情緒與狀態完整分類 */}
        <section className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-mono flex items-center justify-center font-semibold">
                2
              </span>
              <h2 className="text-base font-bold text-stone-900">
                情緒與身心狀態分類（可多選）
              </h2>
            </div>
            <span className="text-xs text-stone-400">
              已選 {selectedEmotions.length + selectedCognitiveStates.length + selectedNeeds.length + selectedBodyStates.length} 項
            </span>
          </div>

          {/* Overwhelmed State Banner */}
          <div
            onClick={() => setOverwhelmed(!overwhelmed)}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              overwhelmed
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    overwhelmed ? 'bg-rose-600 animate-ping' : 'bg-stone-300'
                  }`}
                ></span>
                <span className="text-sm font-semibold text-stone-900">
                  情緒強度與失控感：Overwhelmed（崩潰狀態）
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                此狀態獨立於一般情緒之外，標記極端超載或瀕臨崩潰感。
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                overwhelmed
                  ? 'bg-rose-600 text-white'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {overwhelmed ? '已啟動崩潰狀態' : '未處於崩潰'}
            </span>
          </div>

          {/* 1. 核心情緒 */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              一、核心情緒（Core Emotions）
            </div>
            {CORE_EMOTION_GROUPS.map((group) => (
              <div key={group.id} className="space-y-1.5 pl-2 border-l-2 border-stone-200">
                <div className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
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
                        onClick={() => toggleArrayItem(selectedEmotions, setSelectedEmotions, item)}
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

          {/* 2. 認知與自我評價 */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              二、認知與自我評價（Cognitive & Self-Evaluation）
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COGNITIVE_EVALUATION_ITEMS.map((item) => {
                const isSelected = selectedCognitiveStates.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      toggleArrayItem(
                        selectedCognitiveStates,
                        setSelectedCognitiveStates,
                        item
                      )
                    }
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all min-h-[36px] ${
                      isSelected
                        ? 'bg-violet-700 text-white border-violet-700 font-medium'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. 需求與調節傾向 */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              三、需求與調節傾向（Needs & Regulation Intentions）
            </div>
            <div className="flex flex-wrap gap-1.5">
              {NEEDS_INTENTION_ITEMS.map((item) => {
                const isSelected = selectedNeeds.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayItem(selectedNeeds, setSelectedNeeds, item)}
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

          {/* 4. 身心與生理狀態 */}
          <div className="space-y-2.5 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                四、身心與生理狀態（Mind-Body States）
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
                    onClick={() =>
                      toggleArrayItem(selectedBodyStates, setSelectedBodyStates, item)
                    }
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
                        onClick={() =>
                          toggleArrayItem(selectedBodyStates, setSelectedBodyStates, item)
                        }
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
        </section>

        {/* Step 3: 自動想法與認知檢視 */}
        <section className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-mono flex items-center justify-center font-semibold">
              3
            </span>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                自動想法與認知檢視
              </h2>
              <p className="text-xs text-stone-500">
                檢視想法是否完整、是否存在其他合理解釋，而非單純要求「正向思考」。
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              我當下想到什麼？（未經過濾的原始自動想法）
            </label>
            <textarea
              rows={2}
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              required
              placeholder="例：我每次都會搞砸，大家一定覺得我很沒用，這下死定了..."
              className="w-full text-sm px-3.5 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none font-mincho"
            />
          </div>

          {/* Local Cognitive Patterns Detection Alerts (Non-diagnostic) */}
          {detectedPatterns.length > 0 && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                <Sparkles size={15} className="text-amber-600" />
                <span>偵測到可能的認知模式（提供自我檢視參考，非診斷）：</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {detectedPatterns.map((pat) => (
                  <div
                    key={pat.id}
                    className="p-3 bg-white rounded-lg border border-stone-200 text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-stone-900">
                        【{pat.name}】可能出現
                      </span>
                      <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded font-mono">
                        匹配：{pat.matchedKeywords.join(', ')}
                      </span>
                    </div>
                    <p className="text-stone-600 text-[11px] mb-2">{pat.explanation}</p>
                    <div className="p-2 bg-stone-50/80 rounded border-l-2 border-stone-800 text-[11px] text-stone-700">
                      <strong>可以檢視看看：</strong> {pat.reflectiveQuestion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              這個想法代表什麼？（底層對自己的意涵）
            </label>
            <input
              type="text"
              value={thoughtMeaning}
              onChange={(e) => setThoughtMeaning(e.target.value)}
              placeholder="例：代表自己能力可能不如同儕、害怕讓主管失望..."
              className="w-full text-sm px-3.5 py-2 border border-stone-200 rounded-lg font-mincho"
            />
          </div>

          {/* Initial belief slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-800">
                我有多相信這個想法？（當下原始可信度 0–100%）
              </label>
              <span className="text-sm font-bold font-mono text-stone-900 px-2 py-0.5 bg-stone-100 rounded">
                {belief}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={belief}
              onChange={(e) => setBelief(parseInt(e.target.value))}
              className="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                有哪些證據「支持」這個想法？
              </label>
              <textarea
                rows={3}
                value={evidenceFor}
                onChange={(e) => setEvidenceFor(e.target.value)}
                placeholder="具體事實或客觀依據..."
                className="w-full text-sm px-3.5 py-2 border border-stone-200 rounded-lg resize-none font-mincho"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                有哪些客觀事實「不支持」這個想法？（反證）
              </label>
              <textarea
                rows={3}
                value={evidenceAgainst}
                onChange={(e) => setEvidenceAgainst(e.target.value)}
                placeholder="過去成功的經驗、客觀限制、其他人的正面回饋..."
                className="w-full text-sm px-3.5 py-2 border border-stone-200 rounded-lg resize-none font-mincho"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              有沒有其他合理解釋？（替代性視角）
            </label>
            <textarea
              rows={2}
              value={alternativeThought}
              onChange={(e) => setAlternativeThought(e.target.value)}
              placeholder="例：主管可能只是就事論事追求專案嚴謹，而非針對我的個人能力；我有能力補足缺漏。"
              className="w-full text-sm px-3.5 py-2 border border-stone-200 rounded-lg resize-none font-mincho"
            />
          </div>

          {/* Re-evaluated belief & intensity */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-900">
                  重新思考後，我有多相信原先那個想法？（0–100%）
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-emerald-800 px-2 py-0.5 bg-emerald-100 rounded">
                    {reBelief}%
                  </span>
                  {beliefDelta > 0 && (
                    <span className="text-xs font-mono text-emerald-700">
                      (下降 {beliefDelta}%)
                    </span>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={reBelief}
                onChange={(e) => setReBelief(parseInt(e.target.value))}
                className="w-full accent-emerald-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-900">
                  重新評估後的情緒強度 (1-5)
                </label>
                <span className="text-sm font-bold font-mono text-stone-900 px-2 py-0.5 bg-white border border-stone-200 rounded">
                  {reEvaluatedIntensity.toFixed(1)} / 5.0
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={reEvaluatedIntensity}
                onChange={(e) =>
                  setReEvaluatedIntensity(parseFloat(e.target.value))
                }
                className="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                下一步可以採取什麼具體行動？
              </label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="例：整理補充數據寄給主管、先去散步 10 分鐘深呼吸..."
                className="w-full text-sm px-3.5 py-2 border border-stone-200 rounded-lg bg-white font-mincho"
              />
            </div>
          </div>
        </section>

        {/* Step 4: 事件前後狀態變化 */}
        <section className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-mono flex items-center justify-center font-semibold">
                4
              </span>
              <h2 className="text-base font-bold text-stone-900">
                事件前後身心狀態變化
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span>心情 Δ: <strong className={moodDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{moodDelta >= 0 ? `+${moodDelta}` : moodDelta}</strong></span>
              <span>精力 Δ: <strong className={energyDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{energyDelta >= 0 ? `+${energyDelta}` : energyDelta}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
              <h3 className="text-xs font-bold text-stone-700 uppercase">心情指標變化</h3>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>事件前心情</span>
                  <span className="font-mono font-bold">{beforeMood.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={beforeMood}
                  onChange={(e) => setBeforeMood(parseFloat(e.target.value))}
                  className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>事件後心情</span>
                  <span className="font-mono font-bold">{afterMood.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={afterMood}
                  onChange={(e) => setAfterMood(parseFloat(e.target.value))}
                  className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
              <h3 className="text-xs font-bold text-stone-700 uppercase">精力指標變化</h3>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>事件前精力</span>
                  <span className="font-mono font-bold text-amber-700">{beforeEnergy.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={beforeEnergy}
                  onChange={(e) => setBeforeEnergy(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>事件後精力</span>
                  <span className="font-mono font-bold text-amber-700">{afterEnergy.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={afterEnergy}
                  onChange={(e) => setAfterEnergy(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Step 5: 目標感與完成感 */}
        <section className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-mono flex items-center justify-center font-semibold">
              5
            </span>
            <h2 className="text-base font-bold text-stone-900">
              目標感與完成感
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                <span>今日目標感 (1-5)</span>
                <span className="font-mono">{goalSense.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={goalSense}
                onChange={(e) => setGoalSense(parseFloat(e.target.value))}
                className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                <span>今日完成感 (1-5)</span>
                <span className="font-mono">{completionSense.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={completionSense}
                onChange={(e) => setCompletionSense(parseFloat(e.target.value))}
                className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                目標狀態
              </label>
              <select
                value={goalState}
                onChange={(e) => setGoalState(e.target.value as GoalState)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg bg-stone-50"
              >
                {GOAL_STATES.map((gs) => (
                  <option key={gs} value={gs}>
                    {gs}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                完成程度
              </label>
              <select
                value={completionLevel}
                onChange={(e) => setCompletionLevel(e.target.value as CompletionLevel)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg bg-stone-50"
              >
                {COMPLETION_LEVELS.map((cl) => (
                  <option key={cl} value={cl}>
                    {cl}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Step 6: 社交影響（選填模組） */}
        <section className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-mono flex items-center justify-center font-semibold">
                6
              </span>
              <h2 className="text-base font-bold text-stone-900">
                社交事件影響分析（選填）
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsSocialEvent(!isSocialEvent)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                isSocialEvent
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isSocialEvent ? '已啟用社交紀錄' : '＋ 啟用此模組'}
            </button>
          </div>

          {isSocialEvent && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-stone-500">
                系統將分開分析「社交對心情的影響」與「社交對精力的影響」，釐清社交能量的充能與消耗。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-stone-800">社交前後心情</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span>前: {socialBeforeMood}</span>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.5"
                      value={socialBeforeMood}
                      onChange={(e) => setSocialBeforeMood(parseFloat(e.target.value))}
                      className="accent-stone-900 flex-1"
                    />
                    <span>後: {socialAfterMood}</span>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.5"
                      value={socialAfterMood}
                      onChange={(e) => setSocialAfterMood(parseFloat(e.target.value))}
                      className="accent-stone-900 flex-1"
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-stone-800">社交前後精力</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span>前: {socialBeforeEnergy}</span>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.5"
                      value={socialBeforeEnergy}
                      onChange={(e) => setSocialBeforeEnergy(parseFloat(e.target.value))}
                      className="accent-amber-600 flex-1"
                    />
                    <span>後: {socialAfterEnergy}</span>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.5"
                      value={socialAfterEnergy}
                      onChange={(e) => setSocialAfterEnergy(parseFloat(e.target.value))}
                      className="accent-amber-600 flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  社交後感受（可多選）
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SOCIAL_FEELINGS.map((feel) => (
                    <button
                      key={feel}
                      type="button"
                      onClick={() => toggleSocialFeeling(feel)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        socialFeelings.includes(feel)
                          ? 'bg-stone-900 text-white border-stone-900 font-medium'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {feel}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Step 7: 他人評價影響（選填模組） */}
        <section className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-mono flex items-center justify-center font-semibold">
                7
              </span>
              <h2 className="text-base font-bold text-stone-900">
                他人評價影響（選填）
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsEvaluationEvent(!isEvaluationEvent)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                isEvaluationEvent
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {isEvaluationEvent ? '已啟用評價紀錄' : '＋ 啟用此模組'}
            </button>
          </div>

          {isEvaluationEvent && (
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
                  <span>這件事對我的影響程度 (1-5)</span>
                  <span className="font-mono">{evaluationImpact.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.5"
                  value={evaluationImpact}
                  onChange={(e) => setEvaluationImpact(parseFloat(e.target.value))}
                  className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  我最在意的是什麼：
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EVALUATION_CONCERNS.map((con) => (
                    <button
                      key={con}
                      type="button"
                      onClick={() => setEvaluationConcern(con)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        evaluationConcern === con
                          ? 'bg-stone-900 text-white border-stone-900 font-medium'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {con}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={evaluationConcernDetail}
                  onChange={(e) => setEvaluationConcernDetail(e.target.value)}
                  placeholder="補充補充具體在意的情節..."
                  className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg"
                />
              </div>
            </div>
          )}
        </section>

        {/* Step 8: 預期與實際（選填模組） */}
        <section className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-mono flex items-center justify-center font-semibold">
                8
              </span>
              <h2 className="text-base font-bold text-stone-900">
                預期 vs 實際（落差檢視）
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setHasExpectationReality(!hasExpectationReality)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                hasExpectationReality
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {hasExpectationReality ? '已啟用預期 vs 實際' : '＋ 啟用此模組'}
            </button>
          </div>

          {hasExpectationReality && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-stone-50 rounded-xl space-y-3">
                <span className="text-xs font-bold text-stone-800">事件發生前：預期</span>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>預期心情</span>
                    <span className="font-mono">{expectedMood.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.5"
                    value={expectedMood}
                    onChange={(e) => setExpectedMood(parseFloat(e.target.value))}
                    className="w-full accent-stone-900"
                  />
                </div>
                <textarea
                  rows={2}
                  value={expectedOutcome}
                  onChange={(e) => setExpectedOutcome(e.target.value)}
                  placeholder="預期會發生什麼結果？"
                  className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg bg-white resize-none"
                />
              </div>

              <div className="p-4 bg-stone-50 rounded-xl space-y-3">
                <span className="text-xs font-bold text-stone-800">事件發生後：實際</span>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>實際心情</span>
                    <span className="font-mono">{actualMood.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.5"
                    value={actualMood}
                    onChange={(e) => setActualMood(parseFloat(e.target.value))}
                    className="w-full accent-stone-900"
                  />
                </div>
                <textarea
                  rows={2}
                  value={actualOutcome}
                  onChange={(e) => setActualOutcome(e.target.value)}
                  placeholder="實際結果是什麼？"
                  className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg bg-white resize-none font-mincho"
                />
              </div>
            </div>
          )}
        </section>

        {/* Step 9: 事件重要性與調節行動 */}
        <section className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-mono flex items-center justify-center font-semibold">
              9
            </span>
            <h2 className="text-base font-bold text-stone-900">
              事件重要性與實際調節行動
            </h2>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-stone-800 mb-1">
              <span>當下事件重要性 (1-5)</span>
              <span className="font-mono font-bold">{importance.toFixed(1)} / 5.0</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={importance}
              onChange={(e) => setImportance(parseFloat(e.target.value))}
              className="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              可於數天後在紀錄列表中再次評估此數值，觀察心理距離如何隨時間拉開。
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              實際採取的調節行動
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {REGULATION_ACTION_SUGGESTIONS.map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setActualAction(act)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                    actualAction === act
                      ? 'bg-stone-900 text-white border-stone-900 font-medium'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={actualAction}
              onChange={(e) => setActualAction(e.target.value)}
              placeholder="例：出門慢跑 20 分鐘、洗熱水澡放鬆、與好友通電話..."
              className="w-full text-sm px-3.5 py-2.5 border border-stone-200 rounded-lg font-mincho"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              行動後的結果與身心感受
            </label>
            <input
              type="text"
              value={actionOutcome}
              onChange={(e) => setActionOutcome(e.target.value)}
              placeholder="例：身體緊繃感減輕，呼吸平緩，思緒逐漸聚焦..."
              className="w-full text-sm px-3.5 py-2.5 border border-stone-200 rounded-lg font-mincho"
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
          <button
            type="submit"
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-stone-900 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-md active:scale-[0.99] min-h-[48px]"
          >
            <CheckCircle2 size={18} />
            <span>儲存完整深入紀錄</span>
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto py-3.5 px-6 rounded-xl border border-stone-300 text-stone-700 font-medium text-sm hover:bg-stone-50 min-h-[48px]"
            >
              取消
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
