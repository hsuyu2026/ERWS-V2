export interface CognitivePatternHint {
  id: string;
  name: string;
  matchedKeywords: string[];
  explanation: string;
  reflectiveQuestion: string;
}

interface PatternRule {
  id: string;
  name: string;
  keywords: string[];
  explanation: string;
  reflectiveQuestion: string;
}

const PATTERN_RULES: PatternRule[] = [
  {
    id: 'overgeneralization',
    name: '過度概括',
    keywords: [
      '總是',
      '每次都',
      '永遠',
      '全都',
      '全都是',
      '從來沒有',
      '從來不',
      '大家都',
      '所有人都',
      '老是',
      '永遠不可能',
      '一定又會',
    ],
    explanation: '可能將單一事件的結果擴大推論為普遍發生的定律。',
    reflectiveQuestion: '有沒有任何一次例外？過去是否有過不同的情況？',
  },
  {
    id: 'catastrophizing',
    name: '災難化',
    keywords: [
      '完蛋了',
      '死定了',
      '毀了',
      '徹底完蛋',
      '無可挽救',
      '最糟的',
      '世界末日',
      '完全沒救',
      '無法收拾',
      '完蛋',
      '慘了',
    ],
    explanation: '可能不自覺地想像最極端、最壞的嚴重後果。',
    reflectiveQuestion: '客觀來說，最可能發生的實際情況是什麼？若真的發生最差狀況，手邊能做什麼緩衝？',
  },
  {
    id: 'black_and_white',
    name: '非黑即白',
    keywords: [
      '不是成功就是失敗',
      '完全失敗',
      '毫無意義',
      '一文不值',
      '必須完美',
      '全對或全錯',
      '要嘛',
      '不是...就是',
      '零分',
      '全盤皆輸',
      '白費了',
    ],
    explanation: '可能傾向用非黑即白、二分法的視角看待事物，忽略了中間的光譜。',
    reflectiveQuestion: '在這兩個極端之間，是否存在 20%、50% 或 80% 的進展或灰階空間？',
  },
  {
    id: 'mind_reading',
    name: '讀心',
    keywords: [
      '他一定覺得',
      '大家一定在笑我',
      '別人都看不起我',
      '他肯定討厭我',
      '他們心裡想',
      '別人心裡一定',
      '肯定是在議論我',
      '他討厭我',
      '他們都在看我',
    ],
    explanation: '可能在沒有具體客觀證實的情況下，推論他人對自己有負面看法。',
    reflectiveQuestion: '對方是否有親口告知？有沒有可能他只是在忙或處於疲倦狀態？',
  },
  {
    id: 'personalization',
    name: '個人化',
    keywords: [
      '都是我的錯',
      '如果不是我',
      '都是我害的',
      '怪我',
      '因為我太糟',
      '都怪我沒做好',
      '一切是我引起的',
    ],
    explanation: '可能將超出個人單獨控制範圍的外在事件，全部歸咎於自身責任。',
    reflectiveQuestion: '除了自己的因素外，還有哪些環境、他人或不可抗力的外在變數參與其中？',
  },
  {
    id: 'should_statements',
    name: '應該陳述',
    keywords: [
      '我應該',
      '我必須',
      '我一定得',
      '本來就該',
      '非得',
      '不應該這樣',
      '不能出任何錯',
      '必須做到好',
      '絕不能',
    ],
    explanation: '可能對自己或他人設定了剛性不可違背的「必須」與「應該」規則。',
    reflectiveQuestion: '如果用「我希望」或「如果能做到會很好，但做不到也還能調整」替代「必須」，感受有何不同？',
  },
  {
    id: 'selective_abstraction',
    name: '選擇性注意',
    keywords: [
      '只有我沒做到',
      '只有壞事',
      '全都是缺點',
      '看不到好的',
      '沒半點好事',
      '只看到那件出錯的事',
      '其他都沒用',
    ],
    explanation: '注意力可能高度聚焦在唯一的瑕疵或失誤上，未納入其他順利的部分。',
    reflectiveQuestion: '在整件事情的過程中，有沒有哪怕一個小細節或階段是平穩或處理得還可以的？',
  },
  {
    id: 'labeling',
    name: '負面標籤',
    keywords: [
      '我是個廢物',
      '我是個魯蛇',
      '我是個笨蛋',
      '我是失敗者',
      '我是個拖累',
      '我很沒用',
      '我就是個負擔',
      '徹底無能',
      '爛人',
    ],
    explanation: '可能用概括性、貶低性的標籤定義整個人的價值，而非描述特定行為。',
    reflectiveQuestion: '這是一次「某個行為未達預期」，還是代表「整個人徹底無價值」？兩者有何區別？',
  },
];

/**
 * Detect potential cognitive pattern hints from thought text.
 * Output tone is strictly non-diagnostic ("可能出現", "可以檢視看看").
 */
export function detectCognitivePatterns(thoughtText: string): CognitivePatternHint[] {
  if (!thoughtText || thoughtText.trim().length === 0) {
    return [];
  }

  const normalizedText = thoughtText.toLowerCase();
  const detected: CognitivePatternHint[] = [];

  for (const rule of PATTERN_RULES) {
    const matched = rule.keywords.filter((kw) => normalizedText.includes(kw.toLowerCase()));
    if (matched.length > 0) {
      detected.push({
        id: rule.id,
        name: rule.name,
        matchedKeywords: matched,
        explanation: rule.explanation,
        reflectiveQuestion: rule.reflectiveQuestion,
      });
    }
  }

  return detected;
}

export const ALL_COGNITIVE_PATTERNS = PATTERN_RULES;
