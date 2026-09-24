import { ERWSRecord } from '../types/erws';

export const FIXED_AI_PROMPT = `請分析以下情緒紀錄，從認知、情緒、行為與身心狀態四個面向找出近期趨勢。請區分客觀資料與推測，不進行心理疾病診斷。請指出可能的觸發因素、恢復因素、反覆出現的自動想法、情緒與事件之間的關係，以及值得使用者進一步觀察的地方。若資料不足，請明確指出，不要自行補充不存在的資訊。最後提供具體但非命令式的自我觀察建議。`;

export const FOCUS_AREAS = [
  '情緒波動',
  '精力變化',
  '認知模式',
  '社交影響',
  '目標感',
  '身心狀態',
  '預期與實際落差',
  '心理距離降溫',
];

export const ANALYSIS_OBJECTIVE_OPTIONS = [
  {
    id: 'self-understanding',
    label: '深入自我理解',
    desc: '聚焦在身心連動規律與情緒高低起伏的內在觸發點',
  },
  {
    id: 'lifestyle-adjustment',
    label: '生活節奏與調節調整',
    desc: '分析哪些日常行動（運動、獨處、散步等）能有效充能與恢復',
  },
  {
    id: 'spotting-blindspots',
    label: '尋找思維盲點',
    desc: '客觀檢驗過度概括、讀心、災難化等未經證實的自動想法',
  },
  {
    id: 'counseling-prep',
    label: '諮商或對談前準備',
    desc: '將近期的身心事件整理為結構清晰、重點明確的客觀彙整',
  },
  {
    id: 'daily-reflection',
    label: '日常平靜反思',
    desc: '以溫和、關懷與同理的視角回顧近期的心路歷程',
  },
];

export interface BuildAiExportOptions {
  records: ERWSRecord[];
  timeRange: string;
  customStart?: string;
  customEnd?: string;
  focusAreas: string[];
  objective: string;
}

export function buildAiExportPrompt(options: BuildAiExportOptions): string {
  const { records, timeRange, customStart, customEnd, focusAreas, objective } = options;

  const objObj = ANALYSIS_OBJECTIVE_OPTIONS.find((o) => o.id === objective) || ANALYSIS_OBJECTIVE_OPTIONS[0];

  const lines: string[] = [];

  lines.push('【AI 分析專用指示詞（System Prompt 指引）】');
  lines.push(
    '你是專業的身心狀態與認知觀察夥伴。請分析以下使用者儲存在 ERWS 的真實紀錄。'
  );
  lines.push('請嚴格遵守以下原則：');
  lines.push('1. 以同理、客觀、非診斷的語氣進行分析，絕對避免給予心理疾病標籤（如憂鬱症、焦慮症等）。');
  lines.push('2. 聚焦在「模式辨識（Pattern Recognition）」、「觸發因素」、「恢復因素」以及「認知與身心狀態之間的連動關係」。');
  lines.push('3. 區分客觀事實與推測，若資料有限，請誠實說明，不可虛構未提及的情節。');
  lines.push('4. 提出有助於自我觀察的問題，而不是直接給予強硬指導或單純要求正向思考。');
  lines.push(`5. 本次分析目的：【${objObj.label}】— ${objObj.desc}。`);
  lines.push(`6. 本次聚焦分析重點：${focusAreas.join('、')}。`);
  lines.push('');

  lines.push('【結構化身心資料（ERWS 紀錄資料鏈）】');
  lines.push(
    `時間區間：${timeRange}${customStart ? ` (${customStart} ~ ${customEnd})` : ''}，共 ${records.length} 筆紀錄：`
  );
  lines.push('');

  if (records.length === 0) {
    lines.push('（所選期間內無符合之紀錄資料）');
    return lines.join('\n');
  }

  // Sort chronological ascending
  const sorted = [...records].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  sorted.forEach((r, idx) => {
    lines.push(`=== 紀錄 #${idx + 1} (${r.date} ${r.time}) ===`);
    lines.push(`- 心情指數: ${r.mood} / 5.0 | 精力值: ${r.energy} / 5.0`);
    if (r.overwhelmed) {
      lines.push(`- 狀態標記: Overwhelmed（崩潰／超載感狀態）`);
    }
    if (r.emotions && r.emotions.length > 0) {
      lines.push(`- 標籤: ${r.emotions.join('、')}`);
    }
    if (r.cognitiveStates && r.cognitiveStates.length > 0) {
      lines.push(`- 認知與自我評價: ${r.cognitiveStates.join('、')}`);
    }
    if (r.needs && r.needs.length > 0) {
      lines.push(`- 需求與調節傾向: ${r.needs.join('、')}`);
    }
    if (r.bodyStates && r.bodyStates.length > 0) {
      lines.push(`- 身心與生理狀態: ${r.bodyStates.join('、')}`);
    }
    if (r.event) {
      lines.push(`- 事件類型 [${r.eventCategory || '未分類'}]: ${r.event}`);
    }
    if (r.thought) {
      lines.push(`- 當下自動想法: 「${r.thought}」`);
    }
    if (r.thoughtMeaning) {
      lines.push(`- 想法深層意涵: ${r.thoughtMeaning}`);
    }
    if (r.belief !== undefined) {
      lines.push(
        `- 原始可信度: ${r.belief}%${r.reBelief !== undefined ? ` → 檢視反證後降至: ${r.reBelief}%` : ''}`
      );
    }
    if (r.evidenceFor || r.evidenceAgainst) {
      lines.push(
        `- 支持客觀證據: ${r.evidenceFor || '無'} | 不支持反證: ${r.evidenceAgainst || '無'}`
      );
    }
    if (r.alternativeThought) {
      lines.push(`- 替代合理解釋: 「${r.alternativeThought}」`);
    }
    if (r.beforeMood !== undefined && r.afterMood !== undefined) {
      lines.push(
        `- 事件前後心情: ${r.beforeMood} → ${r.afterMood} (Δ ${Math.round((r.afterMood - r.beforeMood) * 10) / 10})`
      );
    }
    if (r.beforeEnergy !== undefined && r.afterEnergy !== undefined) {
      lines.push(
        `- 事件前後精力: ${r.beforeEnergy} → ${r.afterEnergy} (Δ ${Math.round((r.afterEnergy - r.beforeEnergy) * 10) / 10})`
      );
    }
    if (r.isSocialEvent) {
      lines.push(
        `- 社交影響: 心情 ${r.socialBeforeMood ?? '—'} → ${r.socialAfterMood ?? '—'} | 精力 ${r.socialBeforeEnergy ?? '—'} → ${r.socialAfterEnergy ?? '—'}`
      );
      if (r.socialFeelings && r.socialFeelings.length > 0) {
        lines.push(`  社交後感受: ${r.socialFeelings.join('、')}`);
      }
    }
    if (r.isEvaluationEvent) {
      lines.push(
        `- 他人評價影響: 程度 ${r.evaluationImpact ?? '—'} / 5.0 | 最在意: ${r.evaluationConcern ?? '—'}`
      );
    }
    if (r.hasExpectationReality) {
      lines.push(
        `- 預期 vs 實際: 預期心情 ${r.expectedMood ?? '—'} (預期結果「${r.expectedOutcome ?? '—'}」) vs 實際心情 ${r.actualMood ?? '—'} (實際「${r.actualOutcome ?? '—'}」)`
      );
    }
    if (r.importance !== undefined) {
      lines.push(
        `- 當下重要性: ${r.importance} / 5.0${r.reEvaluatedImportance !== undefined ? ` (隔期重新評估降溫至: ${r.reEvaluatedImportance} / 5.0)` : ''}`
      );
    }
    if (r.actualAction || r.actionOutcome) {
      lines.push(
        `- 實際調節行動: ${r.actualAction || '未記錄'} → 行動後結果: ${r.actionOutcome || '未記錄'}`
      );
    }
    lines.push('');
  });

  lines.push('【請開始您的客觀、同理分析，並提出 2~3 個值得我進一步自我觀察的提問】：');

  return lines.join('\n');
}

export type ExportMode = 'full' | 'summary';

export interface FormatAIOptions {
  startDate: string;
  endDate: string;
  mode: ExportMode;
  records: ERWSRecord[];
}

export function formatAIPromptAndRecords(options: FormatAIOptions): string {
  const { startDate, endDate, mode, records } = options;
  return buildAiExportPrompt({
    records,
    timeRange: `${startDate} ~ ${endDate}`,
    customStart: startDate,
    customEnd: endDate,
    focusAreas: FOCUS_AREAS,
    objective: 'self-understanding',
  });
}
