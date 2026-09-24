export type EmotionCategory =
  | 'high_neg_anger'     // 🔴 高能量負向：憤怒與攻擊性
  | 'high_neg_fear'      // 🟠 高能量負向：焦慮與恐懼
  | 'low_neg_sadness'    // 🔵 低能量負向：悲傷與耗竭
  | 'pos_joy'            // 🟢 正向：愉悅／開心
  | 'pos_confidence'     // 🟢 正向：成就／自信
  | 'pos_calm'           // 🟢 正向：安定／安全
  | 'pos_vitality'       // 🟢 正向：活力／興奮
  | 'pos_connection'     // 🟢 正向：人際／連結
  | 'pos_hope';          // 🟢 正向：希望／期待

export type EventCategory =
  | '工作'
  | '學業'
  | '人際'
  | '社交'
  | '家庭'
  | '健康'
  | '休閒'
  | '外部評價'
  | '日常雜務'
  | '其他';

export type GoalState =
  | '今天知道自己要做什麼'
  | '今天有想完成的事情'
  | '今天不知道接下來要做什麼'
  | '覺得只是把事情做完'
  | '對接下來的事情有期待';

export type CompletionLevel =
  | '沒有完成'
  | '完成一部分'
  | '大致完成'
  | '超出預期';

export type SocialFeeling =
  | '愉快'
  | '放鬆'
  | '有歸屬感'
  | '溫暖'
  | '疲憊'
  | '有壓力'
  | '覺得需要迎合'
  | '沒有特別感覺';

export type EvaluationConcern =
  | '他人怎麼看我'
  | '擔心能力不足'
  | '努力沒有被認可'
  | '害怕被否定'
  | '其他';

export interface ERWSRecord {
  id: string;
  timestamp: string; // ISO 8601 string, e.g. "2026-09-22T14:30:00.000Z"
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"

  // 1. 基本指標 (1-5, 0.5 step)
  mood: number; // 心情指數 1.0 - 5.0
  energy: number; // 精力值 1.0 - 5.0

  // 2. 標籤與狀態
  emotions: string[]; // 核心情緒標籤 (Core emotions)
  cognitiveStates: string[]; // 認知與自我評價標籤
  needs: string[]; // 需求與調節傾向標籤
  bodyStates: string[]; // 身心與生理狀態標籤
  overwhelmed: boolean; // 是否處於「崩潰」Overwhelmed 狀態

  // 3. 事件與想法
  eventCategory?: EventCategory;
  event: string; // 發生了什麼事？
  thought: string; // 當下想法
  thoughtMeaning?: string; // 這個想法代表什麼？

  // 4. 認知取向深入檢視 (選填/深入模式)
  belief?: number; // 我有多相信這個想法？ 0–100%
  evidenceFor?: string; // 有哪些證據支持這個想法？
  evidenceAgainst?: string; // 有哪些證據不支持這個想法？
  alternativeThought?: string; // 有沒有其他合理解釋？
  reBelief?: number; // 重新思考後，我有多相信這個想法？ 0–100%
  reEvaluatedIntensity?: number; // 重新評估後的情緒強度 1.0 - 5.0
  nextAction?: string; // 下一步可以採取什麼行動？

  // 5. 事件前後變化
  beforeMood?: number; // 事件前心情 1.0 - 5.0
  afterMood?: number; // 事件後心情 1.0 - 5.0
  beforeEnergy?: number; // 事件前精力 1.0 - 5.0
  afterEnergy?: number; // 事件後精力 1.0 - 5.0

  // 6. 目標感與完成感
  goalSense?: number; // 今日目標感 1.0 - 5.0
  completionSense?: number; // 今日完成感 1.0 - 5.0
  goalState?: GoalState;
  completionLevel?: CompletionLevel;

  // 7. 社交影響 (若涉及社交事件)
  isSocialEvent?: boolean;
  socialBeforeMood?: number;
  socialAfterMood?: number;
  socialBeforeEnergy?: number;
  socialAfterEnergy?: number;
  socialFeelings?: SocialFeeling[];

  // 8. 他人評價影響 (若涉及他人評價)
  isEvaluationEvent?: boolean;
  evaluationImpact?: number; // 影響程度 1.0 - 5.0
  evaluationConcern?: EvaluationConcern;
  evaluationConcernDetail?: string;

  // 9. 預期與實際
  hasExpectationReality?: boolean;
  expectedMood?: number; // 預期心情 1.0 - 5.0
  expectedOutcome?: string; // 預期結果
  actualMood?: number; // 實際心情 1.0 - 5.0
  actualOutcome?: string; // 實際結果

  // 10. 事件重要性與心理距離
  importance?: number; // 當下事件重要性 1.0 - 5.0
  reEvaluatedImportance?: number; // 後續再次評估的重要性 1.0 - 5.0
  reEvaluatedDate?: string; // 重新評估日期

  // 11. 調節行動與結果
  actualAction?: string; // 實際採取的行動 (如：散步、小睡、與朋友傾訴)
  actionOutcome?: string; // 行動後結果/感受
}

export type ViewMode =
  | 'dashboard'
  | 'quick-record'
  | 'deep-record'
  | 'records'
  | 'trends'
  | 'cognitive-patterns'
  | 'ai-export'
  | 'settings';
