import React, { useState } from 'react';
import { ERWSRecord } from '../types/erws';
import {
  ALL_COGNITIVE_PATTERNS,
  detectCognitivePatterns,
} from '../utils/cognitiveAnalysis';
import {
  Brain,
  Lightbulb,
  Sparkles,
  HelpCircle,
  Search,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';

interface CognitivePatternsViewProps {
  records: ERWSRecord[];
}

export const CognitivePatternsView: React.FC<CognitivePatternsViewProps> = ({
  records,
}) => {
  const [testThought, setTestThought] = useState('');

  // Analyze all past records for cognitive pattern detections
  const patternCounts: Record<string, number> = {};
  ALL_COGNITIVE_PATTERNS.forEach((p) => {
    patternCounts[p.id] = 0;
  });

  records.forEach((r) => {
    const textToAnalyze = `${r.thought || ''} ${r.thoughtMeaning || ''}`;
    const detected = detectCognitivePatterns(textToAnalyze);
    detected.forEach((d) => {
      patternCounts[d.id] = (patternCounts[d.id] || 0) + 1;
    });
  });

  // Calculate average belief de-escalation
  const recordsWithBeliefShift = records.filter(
    (r) => r.belief !== undefined && r.reBelief !== undefined
  );
  const avgInitialBelief =
    recordsWithBeliefShift.length > 0
      ? recordsWithBeliefShift.reduce((a, b) => a + (b.belief || 0), 0) /
        recordsWithBeliefShift.length
      : 0;
  const avgReBelief =
    recordsWithBeliefShift.length > 0
      ? recordsWithBeliefShift.reduce((a, b) => a + (b.reBelief || 0), 0) /
        recordsWithBeliefShift.length
      : 0;
  const avgDeEscalation = Math.round((avgInitialBelief - avgReBelief) * 10) / 10;

  const testDetections = detectCognitivePatterns(testThought);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 pb-32 lg:pb-16 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
          <Brain size={14} />
          <span>Cognitive Framing & Self-Observation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          認知模式與思維盲點檢驗
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed max-w-3xl">
          我們的大腦常為了節省能量而啟動思維捷徑（自動想法），這並非心理疾病，而是人類的自然認知機制。
          本系統旨在協助您客觀檢查想法是否完整、是否存在其他合理解釋，而非要求「盲目正向思考」。
        </p>
      </div>

      {/* Belief Shift Stats Card */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-xs text-stone-500">深入紀錄檢視前</span>
          <div className="text-2xl font-bold font-mono text-stone-900">
            {avgInitialBelief > 0 ? Math.round(avgInitialBelief) : '—'}%
          </div>
          <p className="text-[11px] text-stone-400">當下原始想法平均可信度</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-stone-500">檢視正反證據後</span>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {avgReBelief > 0 ? Math.round(avgReBelief) : '—'}%
          </div>
          <p className="text-[11px] text-stone-400">重新思考後平均可信度</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-stone-500">信念鬆動與降溫幅度</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 flex items-center gap-1">
            <TrendingDown size={22} />
            <span>{avgDeEscalation > 0 ? `-${avgDeEscalation}%` : '—'}</span>
          </div>
          <p className="text-[11px] text-stone-400">
            基於 {recordsWithBeliefShift.length} 筆深入認知檢視紀錄
          </p>
        </div>
      </div>

      {/* Interactive Thought Tester */}
      <div className="p-6 bg-stone-900 text-stone-100 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400" />
          <h2 className="text-base font-bold text-white">
            本地即時思維檢視演練（即時分析，不儲存）
          </h2>
        </div>
        <p className="text-xs text-stone-300">
          輸入一句當下盤旋在腦海的想法，系統將以純本地規則提供探索性檢視題目（非醫療診斷）：
        </p>

        <div className="space-y-3">
          <input
            type="text"
            value={testThought}
            onChange={(e) => setTestThought(e.target.value)}
            placeholder="例：我每次都會搞砸，他一定覺得我很糟糕，這下完蛋了..."
            className="w-full text-sm px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-white"
          />

          {testThought && (
            <div className="pt-2">
              {testDetections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {testDetections.map((pat) => (
                    <div
                      key={pat.id}
                      className="p-4 bg-stone-800 rounded-xl border border-stone-700 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-300">
                          【{pat.name}】可能出現
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          關鍵字: {pat.matchedKeywords.join(', ')}
                        </span>
                      </div>
                      <p className="text-stone-300 text-[11px]">{pat.explanation}</p>
                      <div className="p-2.5 bg-stone-900/80 rounded border-l-2 border-amber-400 text-stone-200">
                        <strong className="text-white">可以檢視看看：</strong>
                        <p className="mt-0.5">{pat.reflectiveQuestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-stone-800 rounded-xl text-xs text-stone-300">
                  語句中未偵測到明顯的極端概括或黑白字詞。這句話聽起來相對具體客觀。
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 8 Patterns Reference Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-stone-900">
            常見 8 大認知模式指南
          </h2>
          <p className="text-xs text-stone-500">
            點閱了解各模式的常見特徵、可能出現的關鍵詞彙與自我檢驗反思提問。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_COGNITIVE_PATTERNS.map((pattern) => {
            const historyCount = patternCounts[pattern.id] || 0;
            return (
              <div
                key={pattern.id}
                className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <Lightbulb size={15} className="text-amber-600" />
                      <span>{pattern.name}</span>
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                      歷史符合: {historyCount} 次
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {pattern.explanation}
                  </p>

                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {pattern.keywords.slice(0, 6).map((kw, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-50 text-stone-500 border border-stone-100 font-mono"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-700">
                  <span className="font-semibold text-stone-900 block mb-0.5">
                    可以檢視看看（自我反思）：
                  </span>
                  <p className="leading-relaxed">{pattern.reflectiveQuestion}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
