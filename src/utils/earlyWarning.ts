import { ERWSRecord } from '../types/erws';

export interface EarlyWarningResult {
  score: number; // 0 - 100
  zone: 'green' | 'yellow' | 'red';
  zoneLabel: string;
  zoneColorClass: string;
  signals: string[];
  metrics: {
    recentAvgMood: number;
    recentAvgEnergy: number;
    overwhelmedCount: number;
    lowMoodRatio: number;
    bodyFatigueRatio: number;
    consecutiveDecline: boolean;
  };
}

export function calculateEarlyWarning(records: ERWSRecord[]): EarlyWarningResult {
  if (!records || records.length === 0) {
    return {
      score: 15,
      zone: 'green',
      zoneLabel: '狀態平穩',
      zoneColorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      signals: ['目前尚無足夠紀錄資料，持續紀錄以建立客觀趨勢。'],
      metrics: {
        recentAvgMood: 3.5,
        recentAvgEnergy: 3.5,
        overwhelmedCount: 0,
        lowMoodRatio: 0,
        bodyFatigueRatio: 0,
        consecutiveDecline: false,
      },
    };
  }

  // Sort chronologically ascending
  const sorted = [...records].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Take the most recent 14 entries (or up to last 14 days)
  const recent = sorted.slice(-14);
  const totalCount = recent.length;

  const moods = recent.map((r) => r.mood);
  const energies = recent.map((r) => r.energy);

  const avgMood = moods.reduce((a, b) => a + b, 0) / totalCount;
  const avgEnergy = energies.reduce((a, b) => a + b, 0) / totalCount;

  // 1. Low mood ratio (<= 2.5 out of 5)
  const lowMoodCount = recent.filter((r) => r.mood <= 2.5).length;
  const lowMoodRatio = lowMoodCount / totalCount;

  // 2. Overwhelmed (崩潰) count in recent records
  const overwhelmedCount = recent.filter((r) => r.overwhelmed).length;

  // 3. Body fatigue / exhaustion ratio ('疲憊／心累' or '提不起勁' or '壓力山大')
  const fatigueKeywords = ['疲憊／心累', '提不起勁', '壓力山大', '麻木'];
  const fatigueCount = recent.filter((r) =>
    r.bodyStates && r.bodyStates.some((s) => fatigueKeywords.includes(s))
  ).length;
  const bodyFatigueRatio = fatigueCount / totalCount;

  // 4. Consecutive energy decline in last 3 or more entries
  let consecutiveDecline = false;
  if (recent.length >= 3) {
    const last3 = recent.slice(-3);
    if (last3[0].energy > last3[1].energy && last3[1].energy > last3[2].energy) {
      consecutiveDecline = true;
    }
  }

  // 5. High-energy negative emotions ratio
  const highNegCount = recent.filter(
    (r) =>
      r.emotions &&
      r.emotions.some((e) =>
        [
          '焦慮',
          '恐慌',
          '害怕',
          '不安／沒安全感',
          '憤怒',
          '暴躁',
          '煩悶、不爽',
          '氣急敗壞',
        ].includes(e)
      )
  ).length;
  const highNegRatio = highNegCount / totalCount;

  // Calculate composite load score (0 - 100)
  // Base from inverted mood: 5 -> 0, 1 -> 40 points
  const moodLoad = Math.max(0, Math.min(40, (5 - avgMood) * 10));

  // Inverted energy: 5 -> 0, 1 -> 20 points
  const energyLoad = Math.max(0, Math.min(20, (5 - avgEnergy) * 5));

  // Overwhelmed count: up to 25 points
  const overwhelmLoad = Math.min(25, overwhelmedCount * 12);

  // Fatigue ratio: up to 15 points
  const fatigueLoad = bodyFatigueRatio * 15;

  // Consecutive decline penalty
  const trendPenalty = consecutiveDecline ? 10 : 0;

  let rawScore = Math.round(moodLoad + energyLoad + overwhelmLoad + fatigueLoad + trendPenalty);
  rawScore = Math.max(5, Math.min(100, rawScore));

  const signals: string[] = [];

  if (lowMoodRatio >= 0.35) {
    signals.push(
      `最近紀錄中低心情（≤ 2.5分）比例達 ${Math.round(lowMoodRatio * 100)}%`
    );
  }

  if (bodyFatigueRatio >= 0.4) {
    signals.push(
      `「疲憊／心累」或「壓力山大」出現頻率增加（佔 ${Math.round(
        bodyFatigueRatio * 100
      )}%）`
    );
  }

  if (overwhelmedCount > 0) {
    signals.push(`近期 Overwhelmed（崩潰狀態）標記累計 ${overwhelmedCount} 次`);
  }

  if (consecutiveDecline) {
    signals.push('最近連續三筆紀錄顯示精力值連續下降');
  }

  if (highNegRatio >= 0.4) {
    signals.push(
      `焦慮或憤怒等高能量負向情緒出現比例較高（${Math.round(
        highNegRatio * 100
      )}%）`
    );
  }

  if (avgMood >= 3.5 && avgEnergy < 2.5) {
    signals.push('觀察到「心情維持中上但精力偏低」的消耗狀態');
  }

  if (signals.length === 0) {
    signals.push('各項情緒與生理狀態指標波動平穩，維持良好彈性。');
  }

  let zone: 'green' | 'yellow' | 'red' = 'green';
  let zoneLabel = '狀態平穩';
  let zoneColorClass = 'text-emerald-800 bg-emerald-50 border-emerald-200';

  if (rawScore >= 70) {
    zone = 'red';
    zoneLabel = '負荷偏高（留意自我調節）';
    zoneColorClass = 'text-rose-800 bg-rose-50 border-rose-200';
  } else if (rawScore >= 40) {
    zone = 'yellow';
    zoneLabel = '需留意自我照顧';
    zoneColorClass = 'text-amber-800 bg-amber-50 border-amber-200';
  }

  return {
    score: rawScore,
    zone,
    zoneLabel,
    zoneColorClass,
    signals,
    metrics: {
      recentAvgMood: Math.round(avgMood * 10) / 10,
      recentAvgEnergy: Math.round(avgEnergy * 10) / 10,
      overwhelmedCount,
      lowMoodRatio: Math.round(lowMoodRatio * 100) / 100,
      bodyFatigueRatio: Math.round(bodyFatigueRatio * 100) / 100,
      consecutiveDecline,
    },
  };
}
