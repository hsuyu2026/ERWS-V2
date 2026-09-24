import React, { useState } from 'react';

interface Point {
  x: string;
  mood: number;
  energy: number;
  label?: string;
  rawDate?: string;
}

export const TrendLineChart: React.FC<{
  data: Point[];
  height?: number;
}> = ({ data, height = 220 }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-stone-400 border border-stone-100 rounded-xl bg-stone-50/50">
        暫無足夠趨勢資料
      </div>
    );
  }

  const padding = { top: 25, right: 30, bottom: 35, left: 40 };
  const width = 600; // viewBox width
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const minVal = 1;
  const maxVal = 5;

  const getX = (index: number) => {
    if (data.length === 1) return padding.left + plotWidth / 2;
    return padding.left + (index / (data.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    const ratio = (clamped - minVal) / (maxVal - minVal);
    return padding.top + plotHeight - ratio * plotHeight;
  };

  const moodPoints = data.map((d, i) => `${getX(i)},${getY(d.mood)}`).join(' ');
  const energyPoints = data.map((d, i) => `${getX(i)},${getY(d.energy)}`).join(' ');

  return (
    <div className="w-full relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        {/* Horizontal grid lines for 1, 2, 3, 4, 5 */}
        {[1, 2, 3, 4, 5].map((level) => {
          const y = getY(level);
          return (
            <g key={level}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e7e5e4"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-[11px] fill-stone-400 font-mono"
              >
                {level}.0
              </text>
            </g>
          );
        })}

        {/* Mood line (Solid Dark Charcoal) */}
        <polyline
          fill="none"
          stroke="#1c1917"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={moodPoints}
        />

        {/* Energy line (Amber Accent) */}
        <polyline
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={energyPoints}
        />

        {/* Data points */}
        {data.map((d, i) => {
          const mx = getX(i);
          const my = getY(d.mood);
          const ey = getY(d.energy);
          const isHovered = hoverIdx === i;

          return (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}>
              {/* Mood point */}
              <circle
                cx={mx}
                cy={my}
                r={isHovered ? 5 : 3.5}
                fill="#1c1917"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Energy point */}
              <circle
                cx={mx}
                cy={ey}
                r={isHovered ? 4.5 : 3}
                fill="#d97706"
                stroke="#ffffff"
                strokeWidth="1.5"
              />

              {/* X label */}
              {(data.length <= 10 || i % Math.ceil(data.length / 7) === 0 || i === data.length - 1) && (
                <text
                  x={mx}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-[10px] fill-stone-500 font-mono"
                >
                  {d.x}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoverIdx !== null && data[hoverIdx] && (
        <div
          className="absolute top-2 right-4 bg-stone-900 text-stone-100 text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none transition-all flex items-center gap-4 z-20"
        >
          <div>
            <span className="text-stone-400 font-mono">{data[hoverIdx].rawDate || data[hoverIdx].x}</span>
            {data[hoverIdx].label && <div className="text-stone-300 font-medium">{data[hoverIdx].label}</div>}
          </div>
          <div className="flex items-center gap-3 border-l border-stone-700 pl-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-stone-100"></span>
              心情: <strong className="text-white font-mono">{data[hoverIdx].mood}</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              精力: <strong className="text-amber-400 font-mono">{data[hoverIdx].energy}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-stone-900"></span>
          <span>心情指數 (1-5)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-amber-600 border-b border-dashed border-amber-600"></span>
          <span>精力值 (1-5)</span>
        </div>
      </div>
    </div>
  );
};

export const EarlyWarningGauge: React.FC<{
  score: number;
  zone: 'green' | 'yellow' | 'red';
  zoneLabel: string;
}> = ({ score, zone, zoneLabel }) => {
  // SVG semi-circle gauge (180 degrees)
  const radius = 60;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  let strokeColor = '#059669'; // green
  if (zone === 'yellow') strokeColor = '#d97706';
  if (zone === 'red') strokeColor = '#e11d48';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-36 h-20 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 140 80" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 70 A 60 60 0 0 1 130 70"
            fill="none"
            stroke="#e7e5e4"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Colored progress arc */}
          <path
            d="M 10 70 A 60 60 0 0 1 130 70"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute bottom-1 text-center">
          <div className="text-2xl font-bold font-mono tracking-tight text-stone-900">{score}</div>
          <div className="text-[10px] text-stone-500 font-medium -mt-0.5">/ 100 指標</div>
        </div>
      </div>
      <div className="text-xs font-semibold mt-1 px-2.5 py-0.5 rounded-full border border-current" style={{ color: strokeColor }}>
        {zoneLabel}
      </div>
    </div>
  );
};

export const MiniBarComparison: React.FC<{
  label: string;
  before: number;
  after: number;
  unit?: string;
}> = ({ label, before, after, unit = '' }) => {
  const delta = Math.round((after - before) * 10) / 10;
  const isPositive = delta > 0;
  const isNegative = delta < 0;

  return (
    <div className="py-2 border-b border-stone-100 last:border-0 flex items-center justify-between text-xs">
      <span className="text-stone-600 truncate max-w-[140px]">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-stone-400 font-mono">{before} → {after}{unit}</span>
        <span
          className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-medium ${
            isPositive
              ? 'text-emerald-700 bg-emerald-50'
              : isNegative
              ? 'text-rose-700 bg-rose-50'
              : 'text-stone-500 bg-stone-100'
          }`}
        >
          {isPositive ? `+${delta}` : delta}
        </span>
      </div>
    </div>
  );
};
