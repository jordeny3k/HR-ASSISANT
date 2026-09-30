import React, { useState } from 'react';
import { RadarData } from '../types';

interface RadarChartProps {
  radarData: RadarData;
  honestyStatus: 'green' | 'yellow' | 'red';
}

interface AxisDef {
  key: keyof Omit<RadarData, 'greatestGapDimension' | 'gapExplanation'>;
  label: string;
  nameZh: string;
  opposite: string;
}

const AXES: AxisDef[] = [
  { key: 'E', label: 'E', nameZh: '外向 (Extraversion)', opposite: 'I' },
  { key: 'N', label: 'N', nameZh: '直覺 (iNtuition)', opposite: 'S' },
  { key: 'T', label: 'T', nameZh: '思考 (Thinking)', opposite: 'F' },
  { key: 'J', label: 'J', nameZh: '判斷 (Judging)', opposite: 'P' },
  { key: 'I', label: 'I', nameZh: '內向 (Introversion)', opposite: 'E' },
  { key: 'S', label: 'S', nameZh: '實感 (Sensing)', opposite: 'N' },
  { key: 'F', label: 'F', nameZh: '情感 (Feeling)', opposite: 'T' },
  { key: 'P', label: 'P', nameZh: '感知 (Perceiving)', opposite: 'J' },
];

export const RadarChart: React.FC<RadarChartProps> = ({ radarData, honestyStatus }) => {
  const [activeAxis, setActiveAxis] = useState<AxisDef | null>(null);

  const size = 460;
  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = AXES.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Concentric circle levels
  const levels = [0.25, 0.5, 0.75, 1];

  // Helper to convert polar to cartesian coordinates
  // Start from top (-PI/2)
  const getCoordinates = (value: number, index: number) => {
    const normalized = Math.max(0, Math.min(100, value)) / 100;
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * normalized;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate SVG polygon points
  const baselinePoints = AXES.map((axis, i) => {
    const val = radarData[axis.key]?.baseline ?? 50;
    const pt = getCoordinates(val, i);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const convergedPoints = AXES.map((axis, i) => {
    const val = radarData[axis.key]?.converged ?? 50;
    const pt = getCoordinates(val, i);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  // Status colors for converged line
  const convergedStrokeColor =
    honestyStatus === 'green' ? '#10b981' : honestyStatus === 'yellow' ? '#f59e0b' : '#ef4444';
  const convergedFillColor =
    honestyStatus === 'green'
      ? 'rgba(16, 185, 129, 0.25)'
      : honestyStatus === 'yellow'
      ? 'rgba(245, 158, 11, 0.25)'
      : 'rgba(239, 68, 68, 0.25)';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible select-none">
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.3" />
            </radialGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background web circle */}
          <circle cx={center} cy={center} r={radius} fill="url(#radarGlow)" />

          {/* Grid circles */}
          {levels.map((level) => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={radius * level}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray={level === 1 ? 'none' : '4 4'}
              opacity={level === 1 ? 0.8 : 0.45}
            />
          ))}

          {/* Axes rays */}
          {AXES.map((axis, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const endX = center + radius * Math.cos(angle);
            const endY = center + radius * Math.sin(angle);
            const isHovered = activeAxis?.key === axis.key;

            return (
              <line
                key={axis.key}
                x1={center}
                y1={center}
                x2={endX}
                y2={endY}
                stroke={isHovered ? '#60a5fa' : '#334155'}
                strokeWidth={isHovered ? '2' : '1'}
                opacity={0.8}
              />
            );
          })}

          {/* Polygon: Baseline (求職者自述包裝面) */}
          <polygon
            points={baselinePoints}
            fill="rgba(99, 102, 241, 0.2)"
            stroke="#818cf8"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="transition-all duration-700"
          />

          {/* Polygon: Converged (壓力收斂真實面) */}
          <polygon
            points={convergedPoints}
            fill={convergedFillColor}
            stroke={convergedStrokeColor}
            strokeWidth="3"
            filter="url(#glowEffect)"
            className="transition-all duration-700"
          />

          {/* Vertex Points & Labels */}
          {AXES.map((axis, i) => {
            const bVal = radarData[axis.key]?.baseline ?? 50;
            const cVal = radarData[axis.key]?.converged ?? 50;
            const bPt = getCoordinates(bVal, i);
            const cPt = getCoordinates(cVal, i);
            const gap = cVal - bVal;

            // Label coordinate (outside radar)
            const angle = i * angleStep - Math.PI / 2;
            const labelR = radius + 32;
            const labelX = center + labelR * Math.cos(angle);
            const labelY = center + labelR * Math.sin(angle);

            const isHovered = activeAxis?.key === axis.key;

            return (
              <g
                key={axis.key}
                className="cursor-pointer"
                onMouseEnter={() => setActiveAxis(axis)}
                onMouseLeave={() => setActiveAxis(null)}
              >
                {/* Baseline point (purple square/circle) */}
                <circle
                  cx={bPt.x}
                  cy={bPt.y}
                  r={isHovered ? 6 : 4}
                  fill="#c084fc"
                  stroke="#312e81"
                  strokeWidth="2"
                />

                {/* Converged point (solid colored circle) */}
                <circle
                  cx={cPt.x}
                  cy={cPt.y}
                  r={isHovered ? 7 : 5}
                  fill={convergedStrokeColor}
                  stroke="#0f172a"
                  strokeWidth="2"
                />

                {/* Axis Label */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`text-xs font-bold transition-colors ${
                    isHovered ? 'fill-blue-400 font-extrabold text-sm' : 'fill-slate-300'
                  }`}
                >
                  {axis.label}
                </text>

                {/* Gap badge on outer rim */}
                {Math.abs(gap) >= 15 && (
                  <text
                    x={labelX}
                    y={labelY + 14}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={`text-[10px] font-mono font-semibold ${
                      gap > 0 ? 'fill-emerald-400' : 'fill-rose-400'
                    }`}
                  >
                    {gap > 0 ? `+${gap}` : gap}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover inspection tooltip */}
        {activeAxis && (
          <div className="absolute bottom-2 bg-slate-900/95 border border-slate-700 shadow-2xl rounded-lg px-3 py-2 text-xs backdrop-blur-md pointer-events-none transition-all">
            <div className="font-semibold text-slate-200">{activeAxis.nameZh}</div>
            <div className="flex items-center gap-3 mt-1 font-mono text-[11px]">
              <span className="text-indigo-300">
                初始自述: {radarData[activeAxis.key]?.baseline ?? 50}
              </span>
              <span style={{ color: convergedStrokeColor }}>
                壓力收斂: {radarData[activeAxis.key]?.converged ?? 50}
              </span>
              <span
                className={`font-bold ${
                  (radarData[activeAxis.key]?.converged ?? 50) -
                    (radarData[activeAxis.key]?.baseline ?? 50) <
                  0
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                落差:{' '}
                {(radarData[activeAxis.key]?.converged ?? 50) -
                  (radarData[activeAxis.key]?.baseline ?? 50)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Explanation */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-6 h-0.5 border-t-2 border-dashed border-indigo-400"></span>
          <span>初始基線 (自述包裝面)</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-6 h-1 rounded-full"
            style={{ backgroundColor: convergedStrokeColor }}
          ></span>
          <span className="font-semibold text-slate-200">壓力收斂線 (真實本能面)</span>
        </div>
        <div className="text-[11px] text-amber-300/80 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
          * 兩線落差愈顯著，代表該維度之面試修飾包裝成分愈高
        </div>
      </div>
    </div>
  );
};
