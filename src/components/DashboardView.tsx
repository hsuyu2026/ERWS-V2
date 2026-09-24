import React, { useState } from 'react';
import { ERWSRecord, ViewMode } from '../types/erws';
import { calculateEarlyWarning } from '../utils/earlyWarning';
import { TrendLineChart, EarlyWarningGauge } from './SvgCharts';
import {
  Zap,
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Clock,
  Compass,
  CheckCircle2,
  Users,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface DashboardViewProps {
  records: ERWSRecord[];
  onNavigate: (view: ViewMode) => void;
  onEditRecord?: (record: ERWSRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  onNavigate,
  onEditRecord,
}) => {
  const [trendRange, setTrendRange] = useState<'7d' | '30d'>('7d');
  const [timelineDate, setTimelineDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecords = records
    .filter((r) => r.date === todayStr)
    .sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  // Latest today values
  const latestToday = todayRecords.length > 0 ? todayRecords[todayRecords.length - 1] : null;

  const todayMood = latestToday ? latestToday.mood : null;
  const todayEnergy = latestToday ? latestToday.energy : null;
  const todayGoal = latestToday?.goalSense ?? null;
  const todayCompletion = latestToday?.completionSense ?? null;

  // Calculate Early Warning Status
  const earlyWarning = calculateEarlyWarning(records);

  // Filter records for 7d or 30d trend
  const now = new Date();
  const pastDays = trendRange === '7d' ? 7 : 30;
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - pastDays);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);

  const trendFiltered = records
    .filter((r) => r.date >= cutoffStr)
    .sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  // Prepare points for TrendLineChart
  // Group by day for cleaner presentation if multiple records per day, or individual points if <= 10 records
  const trendPoints =
    trendRange === '7d'
      ? trendFiltered.map((r) => ({
          x: `${r.date.slice(5)} ${r.time}`,
          mood: r.mood,
          energy: r.energy,
          label: r.event || r.thought || '紀錄',
          rawDate: `${r.date} ${r.time}`,
        }))
      : trendFiltered.map((r) => ({
          x: r.date.slice(5),
          mood: r.mood,
          energy: r.energy,
          label: r.event || '紀錄',
          rawDate: `${r.date} ${r.time}`,
        }));

  // Intra-day timeline for selected date
  const selectedDayRecords = records
    .filter((r) => r.date === timelineDate)
    .sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  const intraDayPoints = selectedDayRecords.map((r) => ({
    x: r.time,
    mood: r.mood,
    energy: r.energy,
    label: r.event || r.thought,
    rawDate: `${r.date} ${r.time}`,
  }));

  // Aggregations & Insights
  const totalOverwhelmed = records.filter((r) => r.overwhelmed).length;

  // Emotion Category frequency
  const emotionFrequencies: Record<string, number> = {};
  records.forEach((r) => {
    r.emotions?.forEach((e) => {
      emotionFrequencies[e] = (emotionFrequencies[e] || 0) + 1;
    });
  });

  const topEmotions = Object.entries(emotionFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Core Category counts
  const highNegAngerCount = records.reduce(
    (acc, r) =>
      acc +
      (r.emotions?.filter((e) =>
        [
          '憤怒',
          '暴躁',
          '煩悶、不爽',
          '不甘心',
          '怨恨',
          '嫉妒',
          '被背叛的',
          '充滿敵意',
          '委屈不平',
          '氣急敗壞',
        ].includes(e)
      ).length || 0),
    0
  );

  const highNegFearCount = records.reduce(
    (acc, r) =>
      acc +
      (r.emotions?.filter((e) =>
        [
          '焦慮',
          '恐慌',
          '害怕',
          '不安／沒安全感',
          '擔憂',
          '窒息感',
          '驚惶失措',
          '煩躁不安',
          '疑神疑鬼',
          '尷尬',
        ].includes(e)
      ).length || 0),
    0
  );

  const lowNegSadnessCount = records.reduce(
    (acc, r) =>
      acc +
      (r.emotions?.filter((e) =>
        [
          '悲傷',
          '無助',
          '絕望',
          '孤獨／寂寞',
          '沮喪',
          '空虛',
          '失望',
          '被遺棄的',
          '挫折感',
          '憂鬱',
          '無聊',
        ].includes(e)
      ).length || 0),
    0
  );

  const positiveCount = records.reduce(
    (acc, r) =>
      acc +
      (r.emotions?.filter((e) =>
        [
          '開心',
          '愉快',
          '快樂',
          '喜悅',
          '自豪',
          '自信',
          '成就感',
          '平靜',
          '踏實',
          '輕鬆',
          '安心',
          '興奮',
          '振奮',
          '充滿活力',
          '驚喜',
          '溫暖',
          '幸福',
          '感動',
          '感恩',
          '有希望',
          '期待',
          '滿足',
        ].includes(e)
      ).length || 0),
    0
  );

  // Cognitive & Self Evaluation frequency
  const cogFrequencies: Record<string, number> = {};
  records.forEach((r) => {
    r.cognitiveStates?.forEach((c) => {
      cogFrequencies[c] = (cogFrequencies[c] || 0) + 1;
    });
  });
  const topCognitive = Object.entries(cogFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Needs frequency
  const needsFrequencies: Record<string, number> = {};
  records.forEach((r) => {
    r.needs?.forEach((n) => {
      needsFrequencies[n] = (needsFrequencies[n] || 0) + 1;
    });
  });
  const topNeeds = Object.entries(needsFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Mind-Body frequency
  const bodyFrequencies: Record<string, number> = {};
  records.forEach((r) => {
    r.bodyStates?.forEach((b) => {
      bodyFrequencies[b] = (bodyFrequencies[b] || 0) + 1;
    });
  });
  const topBody = Object.entries(bodyFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Event delta calculations
  const recordsWithEventDelta = records.filter(
    (r) => r.beforeMood !== undefined && r.afterMood !== undefined
  );
  const avgEventMoodDelta =
    recordsWithEventDelta.length > 0
      ? recordsWithEventDelta.reduce(
          (acc, r) => acc + ((r.afterMood || 0) - (r.beforeMood || 0)),
          0
        ) / recordsWithEventDelta.length
      : 0;

  // Social event delta
  const socialRecords = records.filter(
    (r) =>
      r.isSocialEvent &&
      r.socialBeforeMood !== undefined &&
      r.socialAfterMood !== undefined
  );
  const socialMoodDelta =
    socialRecords.length > 0
      ? socialRecords.reduce(
          (acc, r) =>
            acc + ((r.socialAfterMood || 0) - (r.socialBeforeMood || 0)),
          0
        ) / socialRecords.length
      : 0;
  const socialEnergyDelta =
    socialRecords.length > 0
      ? socialRecords.reduce(
          (acc, r) =>
            acc + ((r.socialAfterEnergy || 0) - (r.socialBeforeEnergy || 0)),
          0
        ) / socialRecords.length
      : 0;

  // Expectation vs Reality differences
  const expRealityRecords = records.filter(
    (r) =>
      r.hasExpectationReality &&
      r.expectedMood !== undefined &&
      r.actualMood !== undefined
  );
  const avgExpDiff =
    expRealityRecords.length > 0
      ? expRealityRecords.reduce(
          (acc, r) => acc + ((r.actualMood || 0) - (r.expectedMood || 0)),
          0
        ) / expRealityRecords.length
      : 0;

  // Generate objective, purely data-descriptive insights
  const dataInsights: string[] = [];

  const fatigueCount = bodyFrequencies['疲憊／心累'] || 0;
  if (fatigueCount >= 2) {
    dataInsights.push(`近期紀錄中「疲憊／心累」標籤出現 ${fatigueCount} 次，頻率居身心狀態之首。`);
  }

  if (recordsWithEventDelta.length > 0) {
    const roundedDelta = Math.round(avgEventMoodDelta * 10) / 10;
    const sign = roundedDelta > 0 ? '+' : '';
    dataInsights.push(`已記錄事件的前後心情平均變化為 ${sign}${roundedDelta} 分。`);
  }

  if (socialRecords.length > 0) {
    const sMood = Math.round(socialMoodDelta * 10) / 10;
    const sEng = Math.round(socialEnergyDelta * 10) / 10;
    dataInsights.push(
      `社交事件統計顯示：社交後心情平均變化為 ${sMood > 0 ? '+' : ''}${sMood} 分，而精力平均變化為 ${sEng > 0 ? '+' : ''}${sEng} 分。`
    );
  }

  const selfDoubtCount = cogFrequencies['自我懷疑'] || 0;
  const evalEventsCount = records.filter((r) => r.eventCategory === '外部評價' || r.isEvaluationEvent).length;
  if (selfDoubtCount > 0 && evalEventsCount > 0) {
    dataInsights.push(
      `「自我懷疑」標籤與「外部評價」事件在近期紀錄中有重疊伴隨出現的現象。`
    );
  }

  if (expRealityRecords.length > 0) {
    const roundedExp = Math.round(avgExpDiff * 10) / 10;
    dataInsights.push(
      `預期 vs 實際統計：實際心情平均較預期高出 ${roundedExp > 0 ? '+' : ''}${roundedExp} 分，顯示對結果的預期多偏向保守。`
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-32 lg:pb-16 space-y-8">
      {/* Top Banner / Call-to-Action */}
      <div className="p-6 sm:p-8 bg-stone-900 text-white rounded-3xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            <span>ERWS · Emotion & Cognitive Well-being System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            個人情緒、認知、行為與身心狀態儀表板
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
            透過客觀數據與認知檢視，觀察「事件 → 自動想法 → 身心狀態 → 認知調節 → 結果」的長期模式。
          </p>
        </div>

        {/* Most prominent primary action: 30s Quick Record */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={() => onNavigate('quick-record')}
            className="px-5 py-3 rounded-xl bg-white text-stone-900 font-bold text-sm flex items-center justify-center gap-2 hover:bg-stone-100 transition-all shadow-md active:scale-95"
          >
            <Zap size={16} className="fill-stone-900" />
            <span>30秒快速紀錄</span>
          </button>
          <button
            onClick={() => onNavigate('deep-record')}
            className="px-4 py-3 rounded-xl bg-stone-800 text-stone-200 hover:bg-stone-700/80 font-medium text-xs flex items-center justify-center gap-2 transition-colors border border-stone-700"
          >
            <Brain size={15} />
            <span>深入認知檢視</span>
          </button>
        </div>
      </div>

      {/* Row 1: Today's 4 Core Numbers + Early Warning Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Today Mood */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>今日心情 (Mood)</span>
            <span className="font-mono">1.0 - 5.0</span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-stone-900">
              {todayMood !== null ? todayMood.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-stone-400">/ 5.0</span>
          </div>
          <p className="text-[11px] text-stone-500 truncate">
            {todayMood !== null
              ? todayMood >= 3.5
                ? '晴朗平順'
                : todayMood >= 2.5
                ? '稍有低落'
                : '需要放鬆照顧'
              : '今日尚未登記紀錄'}
          </p>
        </div>

        {/* Metric 2: Today Energy */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>今日精力 (Energy)</span>
            <span className="font-mono">1.0 - 5.0</span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-amber-600">
              {todayEnergy !== null ? todayEnergy.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-stone-400">/ 5.0</span>
          </div>
          <p className="text-[11px] text-stone-500 truncate">
            {todayEnergy !== null
              ? todayEnergy >= 3.5
                ? '體力充沛'
                : todayEnergy >= 2.5
                ? '偏累消耗'
                : '極度疲憊需睡眠'
              : '今日尚未登記紀錄'}
          </p>
        </div>

        {/* Metric 3: Goal Sense */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>今日目標感</span>
            <Compass size={14} className="text-stone-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-stone-900">
              {todayGoal !== null ? todayGoal.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-stone-400">/ 5.0</span>
          </div>
          <p className="text-[11px] text-stone-500 truncate">
            {latestToday?.goalState || '未填寫目標狀態'}
          </p>
        </div>

        {/* Metric 4: Completion Sense */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>今日完成感</span>
            <CheckCircle2 size={14} className="text-stone-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-stone-900">
              {todayCompletion !== null ? todayCompletion.toFixed(1) : '—'}
            </span>
            <span className="text-xs text-stone-400">/ 5.0</span>
          </div>
          <p className="text-[11px] text-stone-500 truncate">
            {latestToday?.completionLevel || '未填寫完成程度'}
          </p>
        </div>

        {/* Metric 5: Early Warning Status Gauge (十三、早期預警 0-100) */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>早期狀態預警指標</span>
            <ShieldAlert size={14} className="text-stone-400" />
          </div>
          <div className="my-1">
            <EarlyWarningGauge
              score={earlyWarning.score}
              zone={earlyWarning.zone}
              zoneLabel={earlyWarning.zoneLabel}
            />
          </div>
          <div className="text-[10px] text-stone-400 text-center">
            0-39綠 · 40-69黃 · 70+紅
          </div>
        </div>
      </div>

      {/* Early Warning Objective Signals if yellow or red */}
      {earlyWarning.zone !== 'green' && (
        <div className={`p-4 rounded-2xl border ${earlyWarning.zoneColorClass}`}>
          <div className="flex items-start gap-3 text-xs sm:text-sm">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <span className="font-bold">
                早期狀態預警：{earlyWarning.zoneLabel}
              </span>
              <ul className="list-disc list-inside text-xs space-y-0.5 mt-1">
                {earlyWarning.signals.map((sig, i) => (
                  <li key={i}>{sig}</li>
                ))}
              </ul>
              <p className="text-[11px] opacity-80 pt-1">
                ＊此處僅提供近期資料客觀趨勢描述，不作為心理健康或醫療診斷依據。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Row 2: Trends Charts Section (7d / 30d Mood & Energy + Intra-day Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Line Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <TrendingUp size={18} />
                <span>心情與精力雙軌趨勢</span>
              </h2>
              <p className="text-xs text-stone-500">
                深色實線：心情 (1-5) · 橘色虛線：精力 (1-5)
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg self-start sm:self-auto">
              <button
                onClick={() => setTrendRange('7d')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  trendRange === '7d'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                最近 7 天
              </button>
              <button
                onClick={() => setTrendRange('30d')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  trendRange === '30d'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                最近 30 天
              </button>
            </div>
          </div>

          <TrendLineChart data={trendPoints} height={240} />
        </div>

        {/* Intra-day Timeline (1 col) */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                <Clock size={16} />
                <span>單日時間軸</span>
              </h2>
              <input
                type="date"
                value={timelineDate}
                onChange={(e) => setTimelineDate(e.target.value)}
                className="text-xs px-2 py-1 border border-stone-200 rounded bg-stone-50 font-mono"
              />
            </div>
            <p className="text-xs text-stone-500">
              支援一天多筆紀錄，呈現情緒波動曲線。
            </p>
          </div>

          {selectedDayRecords.length > 0 ? (
            <div className="space-y-2">
              <div className="h-28">
                <TrendLineChart data={intraDayPoints} height={110} />
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {selectedDayRecords.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => onEditRecord?.(rec)}
                    className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-stone-500 font-semibold">{rec.time}</span>
                      <span className="truncate text-stone-800">{rec.event || rec.thought || '無具體描述'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono shrink-0 pl-2">
                      <span className="text-stone-900 font-bold">{rec.mood}</span>
                      <span className="text-stone-300">/</span>
                      <span className="text-amber-600 font-bold">{rec.energy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
              該日期尚未建立紀錄
            </div>
          )}

          <button
            onClick={() => onNavigate('quick-record')}
            className="w-full py-2 px-3 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <span>＋ 為今日新增一筆紀錄</span>
          </button>
        </div>
      </div>

      {/* Row 3: 近期客觀洞察 (Recent Insights) & Overwhelm / Delta Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Insights Card (2 cols) */}
        <div className="md:col-span-2 p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-600" />
            <h2 className="text-base font-bold text-stone-900">
              近期客觀資料洞察（Data Insights）
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            基於您的實際儲存數據歸納出客觀關聯，不做推論性心理標籤。
          </p>

          <div className="space-y-2.5">
            {dataInsights.length > 0 ? (
              dataInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-800 flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-800 shrink-0 mt-1.5"></span>
                  <span className="leading-relaxed">{insight}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-xs text-stone-400 text-center bg-stone-50 rounded-xl">
                累積更多日常紀錄後，系統將自動生成客觀統計洞察。
              </div>
            )}
          </div>
        </div>

        {/* Quick Correlation Metrics (1 col) */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Activity size={18} />
            <span>關鍵統計彙整</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="text-stone-600">總紀錄筆數</span>
              <span className="font-mono font-bold text-stone-900">{records.length} 筆</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="text-stone-600">Overwhelmed（崩潰）次數</span>
              <span className="font-mono font-bold text-rose-600">{totalOverwhelmed} 次</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="text-stone-600">事件前後平均心情變化</span>
              <span className="font-mono font-bold text-emerald-700">
                {avgEventMoodDelta >= 0 ? `+${Math.round(avgEventMoodDelta * 10) / 10}` : Math.round(avgEventMoodDelta * 10) / 10}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="text-stone-600">社交前後平均心情變化</span>
              <span className="font-mono font-bold text-stone-900">
                {socialMoodDelta >= 0 ? `+${Math.round(socialMoodDelta * 10) / 10}` : Math.round(socialMoodDelta * 10) / 10}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-stone-600">社交前後平均精力變化</span>
              <span className="font-mono font-bold text-amber-700">
                {socialEnergyDelta >= 0 ? `+${Math.round(socialEnergyDelta * 10) / 10}` : Math.round(socialEnergyDelta * 10) / 10}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Core Emotion Taxonomy & Category Distributions */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-stone-900">
            狀態與情緒分類頻率分布
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            分類呈現「核心情緒」、「認知與自我評價」、「需求與調節」、「身心狀態」的分布比例。
          </p>
        </div>

        {/* 4 Major Core emotion groups */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
            <div className="text-[11px] font-semibold text-rose-700">🔴 高能量負向 (憤怒)</div>
            <div className="text-xl font-bold font-mono text-rose-900 mt-1">{highNegAngerCount} 次</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="text-[11px] font-semibold text-amber-800">🟠 高能量負向 (焦慮)</div>
            <div className="text-xl font-bold font-mono text-amber-900 mt-1">{highNegFearCount} 次</div>
          </div>
          <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200">
            <div className="text-[11px] font-semibold text-sky-800">🔵 低能量負向 (悲傷耗竭)</div>
            <div className="text-xl font-bold font-mono text-sky-900 mt-1">{lowNegSadnessCount} 次</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[11px] font-semibold text-emerald-800">🟢 正向情緒總計</div>
            <div className="text-xl font-bold font-mono text-emerald-900 mt-1">{positiveCount} 次</div>
          </div>
        </div>

        {/* 3 Columns for Secondary Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Cognitive & Self-Evaluation */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="text-xs font-bold text-stone-800">
              認知與自我評價出現頻率
            </div>
            {topCognitive.length > 0 ? (
              <div className="space-y-1.5">
                {topCognitive.map(([name, count]) => (
                  <div key={name} className="flex justify-between items-center text-xs">
                    <span className="text-stone-600">{name}</span>
                    <span className="font-mono font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
                      {count} 次
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-stone-400 py-3">尚無此分類標籤</div>
            )}
          </div>

          {/* Needs & Intentions */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="text-xs font-bold text-stone-800">
              需求與調節傾向頻率
            </div>
            {topNeeds.length > 0 ? (
              <div className="space-y-1.5">
                {topNeeds.map(([name, count]) => (
                  <div key={name} className="flex justify-between items-center text-xs">
                    <span className="text-stone-600">{name}</span>
                    <span className="font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                      {count} 次
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-stone-400 py-3">尚無此分類標籤</div>
            )}
          </div>

          {/* Mind-Body States */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="text-xs font-bold text-stone-800">
              身心與生理狀態頻率
            </div>
            {topBody.length > 0 ? (
              <div className="space-y-1.5">
                {topBody.map(([name, count]) => (
                  <div key={name} className="flex justify-between items-center text-xs">
                    <span className="text-stone-600">{name}</span>
                    <span className="font-mono font-bold text-stone-800 bg-stone-200 px-1.5 py-0.5 rounded">
                      {count} 次
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-stone-400 py-3">尚無此分類標籤</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
