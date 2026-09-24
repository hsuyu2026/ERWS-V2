import React, { useState } from 'react';
import { ERWSRecord } from '../types/erws';
import {
  TrendingUp,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  Target,
  Scale,
  Sparkles,
  ArrowRight,
  Activity,
} from 'lucide-react';

interface TrendsAnalyticsViewProps {
  records: ERWSRecord[];
}

export const TrendsAnalyticsView: React.FC<TrendsAnalyticsViewProps> = ({ records }) => {
  const [activeTab, setActiveTab] = useState<
    'social' | 'goals' | 'evaluation' | 'expectation' | 'distance' | 'regulation'
  >('social');

  // 1. Social Impact Analysis (Separating Mood and Energy impact)
  const socialEvents = records.filter(
    (r) =>
      r.isSocialEvent ||
      r.eventCategory === '社交' ||
      (r.socialBeforeMood !== undefined && r.socialAfterMood !== undefined)
  );

  const socialStats = {
    count: socialEvents.length,
    avgBeforeMood: 0,
    avgAfterMood: 0,
    avgMoodDelta: 0,
    avgBeforeEnergy: 0,
    avgAfterEnergy: 0,
    avgEnergyDelta: 0,
    feelings: {} as Record<string, number>,
  };

  if (socialEvents.length > 0) {
    let validMoodCount = 0;
    let validEnergyCount = 0;

    socialEvents.forEach((r) => {
      const bM = r.socialBeforeMood ?? r.beforeMood;
      const aM = r.socialAfterMood ?? r.afterMood;
      if (bM !== undefined && aM !== undefined) {
        socialStats.avgBeforeMood += bM;
        socialStats.avgAfterMood += aM;
        validMoodCount++;
      }

      const bE = r.socialBeforeEnergy ?? r.beforeEnergy;
      const aE = r.socialAfterEnergy ?? r.afterEnergy;
      if (bE !== undefined && aE !== undefined) {
        socialStats.avgBeforeEnergy += bE;
        socialStats.avgAfterEnergy += aE;
        validEnergyCount++;
      }

      r.socialFeelings?.forEach((f) => {
        socialStats.feelings[f] = (socialStats.feelings[f] || 0) + 1;
      });
    });

    if (validMoodCount > 0) {
      socialStats.avgBeforeMood /= validMoodCount;
      socialStats.avgAfterMood /= validMoodCount;
      socialStats.avgMoodDelta = socialStats.avgAfterMood - socialStats.avgBeforeMood;
    }
    if (validEnergyCount > 0) {
      socialStats.avgBeforeEnergy /= validEnergyCount;
      socialStats.avgAfterEnergy /= validEnergyCount;
      socialStats.avgEnergyDelta = socialStats.avgAfterEnergy - socialStats.avgBeforeEnergy;
    }
  }

  // 2. Goal Sense & Completion Sense correlation
  const goalRecords = records.filter(
    (r) => r.goalSense !== undefined && r.completionSense !== undefined
  );
  const avgGoal =
    goalRecords.length > 0
      ? goalRecords.reduce((acc, r) => acc + (r.goalSense || 0), 0) / goalRecords.length
      : 0;
  const avgCompletion =
    goalRecords.length > 0
      ? goalRecords.reduce((acc, r) => acc + (r.completionSense || 0), 0) / goalRecords.length
      : 0;

  // Check correlation: when completionSense >= 3.5 vs < 3.5
  const highCompletion = goalRecords.filter((r) => (r.completionSense || 0) >= 3.5);
  const lowCompletion = goalRecords.filter((r) => (r.completionSense || 0) < 3.5);
  const avgMoodHighComp =
    highCompletion.length > 0
      ? highCompletion.reduce((a, b) => a + b.mood, 0) / highCompletion.length
      : 0;
  const avgMoodLowComp =
    lowCompletion.length > 0
      ? lowCompletion.reduce((a, b) => a + b.mood, 0) / lowCompletion.length
      : 0;

  // Check if low goal sense correlates with '空虛' or '無聊'
  const lowGoalRecords = records.filter((r) => (r.goalSense || 0) <= 2.5);
  const lowGoalBoredCount = lowGoalRecords.filter(
    (r) => r.emotions?.includes('無聊') || r.emotions?.includes('空虛')
  ).length;

  // 3. Evaluation Concern Impact
  const evalRecords = records.filter(
    (r) => r.isEvaluationEvent || r.eventCategory === '外部評價'
  );
  const concernCounts: Record<string, { count: number; avgMood: number; avgImpact: number }> = {};
  evalRecords.forEach((r) => {
    const concern = r.evaluationConcern || '一般外部評價';
    if (!concernCounts[concern]) {
      concernCounts[concern] = { count: 0, avgMood: 0, avgImpact: 0 };
    }
    concernCounts[concern].count++;
    concernCounts[concern].avgMood += r.mood;
    concernCounts[concern].avgImpact += r.evaluationImpact || 3;
  });

  // 4. Expectation vs Reality difference
  const expRecords = records.filter((r) => r.hasExpectationReality);
  const overEstimatedNegative = expRecords.filter(
    (r) => (r.actualMood ?? 0) > (r.expectedMood ?? 0)
  ).length;
  const underEstimatedNegative = expRecords.filter(
    (r) => (r.actualMood ?? 0) < (r.expectedMood ?? 0)
  ).length;
  const accurateEstimate = expRecords.filter(
    (r) => (r.actualMood ?? 0) === (r.expectedMood ?? 0)
  ).length;

  // 5. Psychological Distance Decay (Importance drop over time)
  const reEvaluatedRecords = records.filter(
    (r) => r.importance !== undefined && r.reEvaluatedImportance !== undefined
  );
  const avgInitialImportance =
    reEvaluatedRecords.length > 0
      ? reEvaluatedRecords.reduce((a, b) => a + (b.importance || 0), 0) /
        reEvaluatedRecords.length
      : 0;
  const avgReEvaluatedImportance =
    reEvaluatedRecords.length > 0
      ? reEvaluatedRecords.reduce((a, b) => a + (b.reEvaluatedImportance || 0), 0) /
        reEvaluatedRecords.length
      : 0;

  // 6. Needs -> Action -> Outcome
  const regulationRecords = records.filter(
    (r) => r.actualAction || r.actionOutcome || (r.needs && r.needs.length > 0)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 pb-32 lg:pb-16 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          深層趨勢與關聯分析
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          探討社交影響、目標感與完成感、外部評價、預期與現實落差，以及事件重要性隨時間拉開的心理距離。
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
        {[
          { id: 'social', label: '社交對身心影響', icon: <Users size={14} /> },
          { id: 'goals', label: '目標與完成感', icon: <Compass size={14} /> },
          { id: 'evaluation', label: '外部評價分析', icon: <Target size={14} /> },
          { id: 'expectation', label: '預期 vs 實際', icon: <Scale size={14} /> },
          { id: 'distance', label: '心理距離與重要性', icon: <Clock size={14} /> },
          { id: 'regulation', label: '需求與調節轉化', icon: <Sparkles size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 min-h-[38px] ${
              activeTab === tab.id
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: 社交影響分開分析 (心情 vs 精力) */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  社交對「心情」與「精力」的分軌影響
                </h2>
                <p className="text-xs text-stone-500">
                  系統嚴格分開分析，避免將愉悅的心情與體力消耗混淆。
                </p>
              </div>
              <span className="text-xs font-mono text-stone-400 bg-stone-50 px-2.5 py-1 rounded-md">
                共 {socialEvents.length} 筆社交紀錄
              </span>
            </div>

            {socialEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Mood impact */}
                <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="text-xs font-bold text-stone-800">
                    社交對「心情指數」的影響
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-stone-500">平均前 → 後</span>
                      <div className="text-xl font-bold font-mono text-stone-900">
                        {socialStats.avgBeforeMood.toFixed(1)} → {socialStats.avgAfterMood.toFixed(1)}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-mono font-bold px-2.5 py-1 rounded-lg ${
                        socialStats.avgMoodDelta >= 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {socialStats.avgMoodDelta >= 0 ? `+${socialStats.avgMoodDelta.toFixed(1)}` : socialStats.avgMoodDelta.toFixed(1)} 分
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {socialStats.avgMoodDelta > 0
                      ? '資料顯示社交互動通常能帶來正向情緒提升與人際連結感。'
                      : '社交互動後心情未見明顯提升或略有壓力。'}
                  </p>
                </div>

                {/* Energy impact */}
                <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="text-xs font-bold text-stone-800">
                    社交對「精力值」的影響
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-stone-500">平均前 → 後</span>
                      <div className="text-xl font-bold font-mono text-amber-700">
                        {socialStats.avgBeforeEnergy.toFixed(1)} → {socialStats.avgAfterEnergy.toFixed(1)}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-mono font-bold px-2.5 py-1 rounded-lg ${
                        socialStats.avgEnergyDelta >= 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {socialStats.avgEnergyDelta >= 0 ? `+${socialStats.avgEnergyDelta.toFixed(1)}` : socialStats.avgEnergyDelta.toFixed(1)} 分
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {socialStats.avgEnergyDelta < 0
                      ? '資料顯示社交雖然愉快，但體能與精力值平均呈現消耗（能量輸出型）。'
                      : '社交活動後精力維持或略有充能。'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-stone-400">
                尚未記錄社交事件，在快速或深入紀錄時勾選「社交事件」即可累積分析。
              </div>
            )}

            {/* Social feelings breakdown */}
            {Object.keys(socialStats.feelings).length > 0 && (
              <div className="pt-4 border-t border-stone-100">
                <h3 className="text-xs font-bold text-stone-800 mb-2">
                  社交後感受頻率分布
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(socialStats.feelings).map(([feel, count]) => (
                    <span
                      key={feel}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-800 text-xs flex items-center gap-1.5 font-medium"
                    >
                      <span>{feel}</span>
                      <span className="font-mono text-stone-500">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: 目標感與完成感 */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-stone-900">
              目標感、完成感與情緒關聯
            </h2>
            <p className="text-xs text-stone-500">
              觀察任務完成度與心情是否呈現穩定正相關，以及目標感低落是否伴隨空虛無聊。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-stone-50 rounded-xl space-y-2">
                <span className="text-xs text-stone-500">完成感較高時 (≥ 3.5) 平均心情</span>
                <div className="text-2xl font-bold font-mono text-emerald-700">
                  {avgMoodHighComp > 0 ? avgMoodHighComp.toFixed(1) : '—'}
                </div>
                <p className="text-[11px] text-stone-400">
                  {highCompletion.length} 筆高完成感紀錄
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl space-y-2">
                <span className="text-xs text-stone-500">完成感較低時 (&lt; 3.5) 平均心情</span>
                <div className="text-2xl font-bold font-mono text-stone-700">
                  {avgMoodLowComp > 0 ? avgMoodLowComp.toFixed(1) : '—'}
                </div>
                <p className="text-[11px] text-stone-400">
                  {lowCompletion.length} 筆低完成感紀錄
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl space-y-2">
                <span className="text-xs text-stone-500">目標感低時伴隨空虛/無聊</span>
                <div className="text-2xl font-bold font-mono text-amber-700">
                  {lowGoalBoredCount} 次
                </div>
                <p className="text-[11px] text-stone-400">
                  共 {lowGoalRecords.length} 筆目標感偏低紀錄
                </p>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed space-y-1">
              <strong>客觀資料觀察結論：</strong>
              <p>
                {avgMoodHighComp > avgMoodLowComp
                  ? `完成任務後的平均心情（${avgMoodHighComp.toFixed(1)}）高於未完成時（${avgMoodLowComp.toFixed(1)}），顯示任務完成度與心情正向回升有穩定對應。`
                  : '目前完成感與心情之間的差異尚不明顯，可持續追蹤更多日常樣本。'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 他人評價影響 */}
      {activeTab === 'evaluation' && (
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-stone-900">
            他人外部評價類型與身心影響
          </h2>
          <p className="text-xs text-stone-500">
            分析哪些具體類型的外在評價情境最容易伴隨情緒波動。
          </p>

          <div className="space-y-3 pt-2">
            {Object.keys(concernCounts).length > 0 ? (
              Object.entries(concernCounts).map(([concern, data]) => {
                const avgM = Math.round((data.avgMood / data.count) * 10) / 10;
                const avgImp = Math.round((data.avgImpact / data.count) * 10) / 10;
                return (
                  <div
                    key={concern}
                    className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-sm text-stone-900">
                        {concern}
                      </span>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        記錄次數：{data.count} 次
                      </p>
                    </div>
                    <div className="flex items-center gap-6 font-mono">
                      <div>
                        <span className="text-stone-400 block text-[10px]">事件影響度</span>
                        <span className="font-bold text-stone-900">{avgImp} / 5.0</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">伴隨平均心情</span>
                        <span className="font-bold text-stone-900">{avgM} / 5.0</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-stone-400">
                尚未記錄涉及他人評價的事件。
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: 預期 vs 實際 */}
      {activeTab === 'expectation' && (
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-stone-900">
            預期心情 vs 實際結果差異
          </h2>
          <p className="text-xs text-stone-500">
            檢驗自己是否傾向高估負面結果或低估正面結果，客觀認識預期與現實之差距。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-stone-50 rounded-xl text-center space-y-1">
              <span className="text-xs text-stone-500">實際結果好於預期</span>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {overEstimatedNegative} 次
              </div>
              <p className="text-[10px] text-stone-400">預期較保守，實際較平順</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl text-center space-y-1">
              <span className="text-xs text-stone-500">符合預期</span>
              <div className="text-2xl font-bold font-mono text-stone-800">
                {accurateEstimate} 次
              </div>
              <p className="text-[10px] text-stone-400">實際心情與預期相符</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl text-center space-y-1">
              <span className="text-xs text-stone-500">實際結果低於預期</span>
              <div className="text-2xl font-bold font-mono text-rose-700">
                {underEstimatedNegative} 次
              </div>
              <p className="text-[10px] text-stone-400">預期樂觀，實際面臨挑戰</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: 心理距離隨時間下降 */}
      {activeTab === 'distance' && (
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-stone-900">
            事件重要性與時間心理距離衰減
          </h2>
          <p className="text-xs text-stone-500">
            觀察隔天或數天後再次評估時，當初覺得「天崩地裂」的事件重要性是否隨時間推移自然降溫。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-stone-50 rounded-xl space-y-1">
              <span className="text-xs text-stone-500">當下評估之平均重要性</span>
              <div className="text-2xl font-bold font-mono text-stone-900">
                {avgInitialImportance > 0 ? avgInitialImportance.toFixed(1) : '—'} / 5.0
              </div>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl space-y-1">
              <span className="text-xs text-stone-500">隔期再次評估之平均重要性</span>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {avgReEvaluatedImportance > 0 ? avgReEvaluatedImportance.toFixed(1) : '—'} / 5.0
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-stone-800">
              已進行隔期心理距離評估之事件：
            </h3>
            {reEvaluatedRecords.length > 0 ? (
              reEvaluatedRecords.map((r) => {
                const diff = (r.reEvaluatedImportance || 0) - (r.importance || 0);
                return (
                  <div
                    key={r.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-stone-900">{r.event || '未命名事件'}</span>
                      <span className="text-stone-400 font-mono ml-2">({r.date})</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span>{r.importance} → {r.reEvaluatedImportance}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          diff < 0
                            ? 'text-emerald-700 bg-emerald-100'
                            : 'text-stone-700 bg-stone-200'
                        }`}
                      >
                        {diff < 0 ? `下降 ${Math.abs(diff).toFixed(1)} 分` : `+${diff.toFixed(1)}`}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-stone-400">
                目前尚未有隔期重新評估紀錄。您可在「紀錄列表」中點選「隔期心理距離評估」進行追蹤。
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: 需求與調節轉化 */}
      {activeTab === 'regulation' && (
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-stone-900">
            「想做什麼 → 實際做什麼 → 身心結果」轉化鏈
          </h2>
          <p className="text-xs text-stone-500">
            檢視當身心發出特定需求時，實際採取的調節行為是否有效舒緩緊張狀態。
          </p>

          <div className="space-y-3 pt-2">
            {regulationRecords.length > 0 ? (
              regulationRecords.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2"
                >
                  <div className="flex justify-between items-center text-stone-400 font-mono">
                    <span>{r.date} {r.time}</span>
                    <span className="text-stone-700">心情: {r.mood} · 精力: {r.energy}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="p-2 bg-white rounded border border-stone-200">
                      <span className="font-bold text-stone-500 block mb-1">當下需求：</span>
                      <span>{r.needs?.join('、') || '未填寫需求'}</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-stone-200">
                      <span className="font-bold text-stone-900 block mb-1">實際採取行動：</span>
                      <span>{r.actualAction || '未填寫行動'}</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-stone-200">
                      <span className="font-bold text-emerald-800 block mb-1">行動後結果：</span>
                      <span>{r.actionOutcome || '未填寫結果'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-stone-400">
                尚未記錄調節行動與結果。
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
