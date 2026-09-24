import { EventCategory, GoalState, CompletionLevel, SocialFeeling, EvaluationConcern } from '../types/erws';

export interface EmotionGroup {
  id: string;
  categoryName: string;
  subCategoryName?: string;
  type: 'core' | 'cognitive' | 'needs' | 'body' | 'overwhelm';
  colorTag: string; // Tailwind color tint for pill/badge
  bgClass: string;
  borderClass: string;
  textClass: string;
  activeClass: string;
  items: string[];
}

export const CORE_EMOTION_GROUPS: EmotionGroup[] = [
  {
    id: 'high_neg_anger',
    categoryName: '高能量負向',
    subCategoryName: '憤怒與攻擊性',
    type: 'core',
    colorTag: 'red',
    bgClass: 'bg-rose-50/70',
    borderClass: 'border-rose-200/80',
    textClass: 'text-rose-700',
    activeClass: 'bg-rose-600 text-white border-rose-600',
    items: [
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
    ],
  },
  {
    id: 'high_neg_fear',
    categoryName: '高能量負向',
    subCategoryName: '焦慮與恐懼',
    type: 'core',
    colorTag: 'orange',
    bgClass: 'bg-amber-50/70',
    borderClass: 'border-amber-200/80',
    textClass: 'text-amber-800',
    activeClass: 'bg-amber-600 text-white border-amber-600',
    items: [
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
    ],
  },
  {
    id: 'low_neg_sadness',
    categoryName: '低能量負向',
    subCategoryName: '悲傷與耗竭',
    type: 'core',
    colorTag: 'blue',
    bgClass: 'bg-sky-50/70',
    borderClass: 'border-sky-200/80',
    textClass: 'text-sky-800',
    activeClass: 'bg-sky-600 text-white border-sky-600',
    items: [
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
    ],
  },
  {
    id: 'pos_joy',
    categoryName: '正向情緒',
    subCategoryName: '愉悅／開心',
    type: 'core',
    colorTag: 'green',
    bgClass: 'bg-emerald-50/70',
    borderClass: 'border-emerald-200/80',
    textClass: 'text-emerald-800',
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
    items: ['開心', '愉快', '快樂', '喜悅'],
  },
  {
    id: 'pos_confidence',
    categoryName: '正向情緒',
    subCategoryName: '成就／自信',
    type: 'core',
    colorTag: 'green',
    bgClass: 'bg-emerald-50/70',
    borderClass: 'border-emerald-200/80',
    textClass: 'text-emerald-800',
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
    items: ['自豪', '自信', '成就感'],
  },
  {
    id: 'pos_calm',
    categoryName: '正向情緒',
    subCategoryName: '安定／安全',
    type: 'core',
    colorTag: 'green',
    bgClass: 'bg-emerald-50/70',
    borderClass: 'border-emerald-200/80',
    textClass: 'text-emerald-800',
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
    items: ['平靜', '踏實', '輕鬆', '安心'],
  },
  {
    id: 'pos_vitality',
    categoryName: '正向情緒',
    subCategoryName: '活力／興奮',
    type: 'core',
    colorTag: 'green',
    bgClass: 'bg-emerald-50/70',
    borderClass: 'border-emerald-200/80',
    textClass: 'text-emerald-800',
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
    items: ['興奮', '振奮', '充滿活力', '驚喜'],
  },
  {
    id: 'pos_connection',
    categoryName: '正向情緒',
    subCategoryName: '人際／連結',
    type: 'core',
    colorTag: 'green',
    bgClass: 'bg-emerald-50/70',
    borderClass: 'border-emerald-200/80',
    textClass: 'text-emerald-800',
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
    items: ['溫暖', '幸福', '感動', '感恩'],
  },
  {
    id: 'pos_hope',
    categoryName: '正向情緒',
    subCategoryName: '希望／期待',
    type: 'core',
    colorTag: 'green',
    bgClass: 'bg-emerald-50/70',
    borderClass: 'border-emerald-200/80',
    textClass: 'text-emerald-800',
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
    items: ['有希望', '期待', '滿足'],
  },
];

export const COGNITIVE_EVALUATION_ITEMS: string[] = [
  '自我懷疑',
  '覺得自己很糟',
  '沒自信／自卑',
  '丟臉／難堪',
  '羞愧',
  '罪惡感',
  '內疚',
  '後悔',
  '矛盾／糾結',
  '冒牌者症候群的感覺',
  '不被理解的',
  '覺得自己是個負擔',
];

export const NEEDS_INTENTION_ITEMS: string[] = [
  '想被陪伴',
  '渴望被抱抱',
  '想獨處',
  '想安靜一下',
  '想逃離目前處境',
  '想找人聊天',
  '想被理解',
  '想休息',
  '想轉移注意力',
];

export const MIND_BODY_ITEMS: string[] = [
  '疲憊／心累',
  '提不起勁',
  '麻木',
  '緊繃',
  '壓力山大',
  '逞強的',
];

export const EVENT_CATEGORIES: EventCategory[] = [
  '工作',
  '學業',
  '人際',
  '社交',
  '家庭',
  '健康',
  '休閒',
  '外部評價',
  '日常雜務',
  '其他',
];

export const GOAL_STATES: GoalState[] = [
  '今天知道自己要做什麼',
  '今天有想完成的事情',
  '今天不知道接下來要做什麼',
  '覺得只是把事情做完',
  '對接下來的事情有期待',
];

export const COMPLETION_LEVELS: CompletionLevel[] = [
  '沒有完成',
  '完成一部分',
  '大致完成',
  '超出預期',
];

export const SOCIAL_FEELINGS: SocialFeeling[] = [
  '愉快',
  '放鬆',
  '有歸屬感',
  '溫暖',
  '疲憊',
  '有壓力',
  '覺得需要迎合',
  '沒有特別感覺',
];

export const EVALUATION_CONCERNS: EvaluationConcern[] = [
  '他人怎麼看我',
  '擔心能力不足',
  '努力沒有被認可',
  '害怕被否定',
  '其他',
];

export const REGULATION_ACTION_SUGGESTIONS: string[] = [
  '充分休息與小睡',
  '出門散步透氣',
  '適度運動放鬆身體',
  '找信任的人傾訴',
  '書寫記錄理清思緒',
  '深呼吸／正念練習',
  '做手工／繪畫／烹飪',
  '專注完成一件微小任務',
  '獨處安靜沉澱',
  '聽音樂／看療癒影片',
];

/**
 * Helper to identify which core category an emotion belongs to
 */
export function getEmotionTagCategory(tag: string): {
  major: string;
  minor: string;
  colorClass: string;
} {
  for (const group of CORE_EMOTION_GROUPS) {
    if (group.items.includes(tag)) {
      return {
        major: group.categoryName,
        minor: group.subCategoryName || '',
        colorClass: group.textClass,
      };
    }
  }
  if (COGNITIVE_EVALUATION_ITEMS.includes(tag)) {
    return { major: '認知與自我評價', minor: '', colorClass: 'text-violet-700' };
  }
  if (NEEDS_INTENTION_ITEMS.includes(tag)) {
    return { major: '需求與調節傾向', minor: '', colorClass: 'text-teal-700' };
  }
  if (MIND_BODY_ITEMS.includes(tag)) {
    return { major: '身心與生理狀態', minor: '', colorClass: 'text-amber-700' };
  }
  return { major: '自訂', minor: '', colorClass: 'text-stone-700' };
}
