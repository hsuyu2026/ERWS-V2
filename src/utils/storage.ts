import { ERWSRecord } from '../types/erws';

const STORAGE_KEY = 'erws_records_v1';
const FIRST_VISIT_KEY = 'erws_initialized_v1';

export function getStoredRecords(): ERWSRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read ERWS records from localStorage:', err);
    return [];
  }
}

export function saveStoredRecords(records: ERWSRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to write ERWS records to localStorage:', err);
  }
}

// Aliases for convenience
export const loadRecordsFromStorage = getStoredRecords;
export const saveRecordsToStorage = saveStoredRecords;

export function addRecord(record: ERWSRecord): ERWSRecord[] {
  const current = getStoredRecords();
  const updated = [record, ...current];
  saveStoredRecords(updated);
  return updated;
}

export function updateRecord(record: ERWSRecord): ERWSRecord[] {
  const current = getStoredRecords();
  const index = current.findIndex((r) => r.id === record.id);
  if (index >= 0) {
    current[index] = record;
    saveStoredRecords(current);
  }
  return [...current];
}

export function deleteRecord(id: string): ERWSRecord[] {
  const current = getStoredRecords();
  const updated = current.filter((r) => r.id !== id);
  saveStoredRecords(updated);
  return updated;
}

export function clearAllRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}

const CUSTOM_BODY_STATES_KEY = 'erws_custom_body_states_v1';

export function getCustomBodyStates(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_BODY_STATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomBodyState(stateName: string): string[] {
  const current = getCustomBodyStates();
  const trimmed = stateName.trim();
  if (trimmed && !current.includes(trimmed)) {
    const updated = [...current, trimmed];
    try {
      localStorage.setItem(CUSTOM_BODY_STATES_KEY, JSON.stringify(updated));
    } catch {}
    return updated;
  }
  return current;
}

export function removeCustomBodyState(stateName: string): string[] {
  const current = getCustomBodyStates();
  const updated = current.filter((s) => s !== stateName);
  try {
    localStorage.setItem(CUSTOM_BODY_STATES_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

/**
 * Generate 7-12 days of rich, realistic demo records illustrating:
 * - High and low mood/energy variation
 * - Cognitive deep dive with distortions and belief shift
 * - Social events with before/after mood and energy
 * - Task completion correlation
 * - Expectation vs reality
 * - Psychological distance decay
 */
export function generateSeedData(): ERWSRecord[] {
  const now = new Date();
  const seed: ERWSRecord[] = [];

  const daysAgo = (days: number, timeStr: string) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    const [h, m] = timeStr.split(':').map(Number);
    d.setHours(h, m, 0, 0);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return {
      timestamp: d.toISOString(),
      date: `${y}-${mo}-${da}`,
      time: timeStr,
    };
  };

  // Day -6: Morning start
  let dt = daysAgo(6, '09:00');
  seed.push({
    id: 'seed-1',
    ...dt,
    mood: 3.5,
    energy: 4.0,
    emotions: ['期待', '平靜'],
    cognitiveStates: [],
    needs: ['想休息'],
    bodyStates: ['緊繃'],
    overwhelmed: false,
    eventCategory: '工作',
    event: '開始新一週的工作專案規劃',
    thought: '這週進度很多，希望一切順利',
    goalSense: 4.0,
    completionSense: 3.5,
    goalState: '今天有想完成的事情',
    completionLevel: '完成一部分',
    beforeMood: 3.0,
    afterMood: 3.5,
    beforeEnergy: 3.5,
    afterEnergy: 4.0,
    importance: 3.5,
    reEvaluatedImportance: 2.5,
  });

  // Day -5: Stressful presentation & cognitive deep dive
  dt = daysAgo(5, '14:20');
  seed.push({
    id: 'seed-2',
    ...dt,
    mood: 2.0,
    energy: 2.5,
    emotions: ['焦慮', '擔憂', '挫折感'],
    cognitiveStates: ['自我懷疑', '冒牌者症候群的感覺', '擔心能力不足'],
    needs: ['想安靜一下', '想逃離目前處境'],
    bodyStates: ['壓力山大', '緊繃', '疲憊／心累'],
    overwhelmed: false,
    eventCategory: '外部評價',
    event: '跨部門會議中主管提出幾項質疑',
    thought: '我一定做不好，大家都覺得我能力不夠，這專案徹底完蛋了',
    thoughtMeaning: '覺得自己無法勝任責任，會被別人看輕',
    belief: 85,
    evidenceFor: '主管當場皺眉並追問了兩次數據來源',
    evidenceAgainst: '主管會議後有私訊說大方向很好，只是數據需要更細緻的驗證；過去同事也曾肯定我的分析',
    alternativeThought: '主管追問是因為客戶會在意這點，這代表專案受到重視，補齊數據即可，不代表我能力全盤失敗。',
    reBelief: 30,
    reEvaluatedIntensity: 2.5,
    nextAction: '將數據來源做成備註附錄，下午 4 點前同步給團隊',
    beforeMood: 2.0,
    afterMood: 3.0,
    beforeEnergy: 2.5,
    afterEnergy: 2.5,
    isEvaluationEvent: true,
    evaluationImpact: 4.5,
    evaluationConcern: '他人怎麼看我',
    evaluationConcernDetail: '害怕主管與同儕覺得自己不專業',
    importance: 4.5,
    reEvaluatedImportance: 2.0,
    actualAction: '出門散步透氣 15 分鐘並喝杯熱茶',
    actionOutcome: '呼吸放慢許多，不再那麼慌亂',
  });

  // Day -4: Task completion
  dt = daysAgo(4, '17:45');
  seed.push({
    id: 'seed-3',
    ...dt,
    mood: 4.5,
    energy: 3.5,
    emotions: ['成就感', '輕鬆', '踏實'],
    cognitiveStates: [],
    needs: ['想獨處', '想休息'],
    bodyStates: ['疲憊／心累'],
    overwhelmed: false,
    eventCategory: '工作',
    event: '終於提交了專案的修正版文件，獲得客戶正面回應',
    thought: '堅持下來把細節做好真的很有價值',
    goalSense: 4.5,
    completionSense: 4.5,
    goalState: '今天知道自己要做什麼',
    completionLevel: '超出預期',
    beforeMood: 3.0,
    afterMood: 4.5,
    beforeEnergy: 3.0,
    afterEnergy: 3.5,
    hasExpectationReality: true,
    expectedMood: 3.5,
    expectedOutcome: '以為客戶會再挑剔不少地方',
    actualMood: 4.5,
    actualOutcome: '客戶直接核准並感謝團隊效率',
    importance: 4.0,
    reEvaluatedImportance: 3.0,
  });

  // Day -3: Social gathering (High mood, but drained energy)
  dt = daysAgo(3, '21:30');
  seed.push({
    id: 'seed-4',
    ...dt,
    mood: 4.0,
    energy: 1.5,
    emotions: ['溫暖', '開心', '感動'],
    cognitiveStates: [],
    needs: ['想獨處', '想休息'],
    bodyStates: ['疲憊／心累', '提不起勁'],
    overwhelmed: false,
    eventCategory: '社交',
    event: '晚上與久違的大學好友聚餐暢聊',
    thought: '大家聚在一起很開心，但整天下來體力真的見底了',
    isSocialEvent: true,
    socialBeforeMood: 3.0,
    socialAfterMood: 4.0,
    socialBeforeEnergy: 2.5,
    socialAfterEnergy: 1.5,
    socialFeelings: ['愉快', '有歸屬感', '溫暖', '疲憊'],
    actualAction: '回到家早早洗熱水澡上床休息',
    actionOutcome: '身心得到放鬆',
    importance: 3.0,
  });

  // Day -2: Weekend fatigue and boredom
  dt = daysAgo(2, '15:00');
  seed.push({
    id: 'seed-5',
    ...dt,
    mood: 2.5,
    energy: 2.0,
    emotions: ['無聊', '空虛', '煩躁不安'],
    cognitiveStates: ['後悔', '矛盾／糾結'],
    needs: ['想被理解', '想轉移注意力'],
    bodyStates: ['提不起勁', '麻木'],
    overwhelmed: false,
    eventCategory: '休閒',
    event: '午後滑手機發呆三個小時，不知不覺天就黑了',
    thought: '今天什麼都沒做，又浪費了一天',
    goalSense: 1.5,
    completionSense: 1.5,
    goalState: '今天不知道接下來要做什麼',
    completionLevel: '沒有完成',
    actualAction: '放下手機換鞋去附近公園慢跑 25 分鐘',
    actionOutcome: '流汗後腦袋清晰許多，無聊感消散',
  });

  // Day -1: Overwhelm episode quickly recovered
  dt = daysAgo(1, '20:15');
  seed.push({
    id: 'seed-6',
    ...dt,
    mood: 1.5,
    energy: 1.5,
    emotions: ['恐慌', '窒息感', '委屈不平'],
    cognitiveStates: ['不被理解的', '覺得自己是個負擔'],
    needs: ['想被陪伴', '渴望被抱抱', '想逃離目前處境'],
    bodyStates: ['緊繃', '壓力山大', '逞強的'],
    overwhelmed: true, // 崩潰狀態
    eventCategory: '家庭',
    event: '家人因瑣事產生爭執，情緒瞬間失控',
    thought: '為什麼每次都是這樣，大家都不能體諒我嗎？',
    belief: 90,
    evidenceFor: '現場言語激烈且沒人願意先退一步',
    evidenceAgainst: '爭執過後彼此冷靜下來有表達歉意，並非針對我個人的價值',
    alternativeThought: '大家當下都很疲憊，情緒話不等於真心否定彼此。',
    reBelief: 45,
    reEvaluatedIntensity: 2.5,
    beforeMood: 1.5,
    afterMood: 2.5,
    beforeEnergy: 1.5,
    afterEnergy: 2.0,
    importance: 4.5,
    reEvaluatedImportance: 3.0,
    actualAction: '到陽台吹涼風深呼吸，打電話給摯友傾訴',
    actionOutcome: '哭過一場後胸口放鬆不少',
  });

  // Today: Calm recovery & reflection
  dt = daysAgo(0, '11:00');
  seed.push({
    id: 'seed-7',
    ...dt,
    mood: 3.5,
    energy: 3.0,
    emotions: ['平靜', '安心', '踏實'],
    cognitiveStates: [],
    needs: ['想安靜一下'],
    bodyStates: [],
    overwhelmed: false,
    eventCategory: '日常雜務',
    event: '整理房間書桌與陽台植栽，泡了一壺手沖咖啡',
    thought: '一步一步來，把眼前的環境整理乾淨，心裡就安定多了',
    goalSense: 3.5,
    completionSense: 4.0,
    goalState: '今天有想完成的事情',
    completionLevel: '大致完成',
    beforeMood: 3.0,
    afterMood: 3.5,
    beforeEnergy: 2.5,
    afterEnergy: 3.0,
    importance: 3.0,
    actualAction: '專注完成小任務與整理環境',
    actionOutcome: '空間變清爽，心境也隨之清明',
  });

  return seed;
}

export const generateSeedRecords = generateSeedData;

/**
 * Export records to JSON file
 */
export function exportToJsonFile(records: ERWSRecord[]): void {
  const jsonStr = JSON.stringify(records, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ERWS_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export records to CSV file
 */
export function exportToCsvFile(records: ERWSRecord[]): void {
  const headers = [
    'ID',
    'Date',
    'Time',
    'Mood',
    'Energy',
    'Overwhelmed',
    'EventCategory',
    'Event',
    'Thought',
    'Emotions',
    'CognitiveStates',
    'Needs',
    'BodyStates',
    'Belief',
    'ReBelief',
    'GoalSense',
    'CompletionSense',
    'ActualAction',
    'ActionOutcome',
  ];

  const escapeCsv = (str: string | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = records.map((r) => [
    escapeCsv(r.id),
    escapeCsv(r.date),
    escapeCsv(r.time),
    r.mood,
    r.energy,
    r.overwhelmed ? '1' : '0',
    escapeCsv(r.eventCategory),
    escapeCsv(r.event),
    escapeCsv(r.thought),
    escapeCsv(r.emotions?.join(';')),
    escapeCsv(r.cognitiveStates?.join(';')),
    escapeCsv(r.needs?.join(';')),
    escapeCsv(r.bodyStates?.join(';')),
    r.belief ?? '',
    r.reBelief ?? '',
    r.goalSense ?? '',
    r.completionSense ?? '',
    escapeCsv(r.actualAction),
    escapeCsv(r.actionOutcome),
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ERWS_records_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import records from JSON string
 */
export function importFromJsonString(
  jsonText: string,
  existingRecords: ERWSRecord[],
  mode: 'append' | 'replace' = 'append'
): { success: boolean; count: number; error?: string; records?: ERWSRecord[] } {
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'JSON 格式需為陣列' };
    }

    // Basic schema check
    const valid = parsed.filter(
      (item) => item && typeof item === 'object' && ('mood' in item || 'timestamp' in item)
    ) as ERWSRecord[];

    if (valid.length === 0) {
      return { success: false, count: 0, error: '未找到有效的 ERWS 紀錄' };
    }

    if (mode === 'replace') {
      saveStoredRecords(valid);
      return { success: true, count: valid.length, records: valid };
    } else {
      // Append mode: deduplicate by id or timestamp
      const existingIds = new Set(existingRecords.map((r) => r.id));
      const newlyAdded = valid.filter((v) => !existingIds.has(v.id));
      const merged = [...newlyAdded, ...existingRecords];
      saveStoredRecords(merged);
      return { success: true, count: newlyAdded.length, records: merged };
    }
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'JSON 解析失敗' };
  }
}

/**
 * Initialize storage with seed data if this is the first visit.
 */
export function initializeStorageIfNeeded(): ERWSRecord[] {
  const isInitialized = localStorage.getItem(FIRST_VISIT_KEY);
  const current = getStoredRecords();

  if (!isInitialized && current.length === 0) {
    const seed = generateSeedData();
    saveStoredRecords(seed);
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    return seed;
  }
  return current;
}
