import React from 'react';
import { Search, ShieldAlert, RotateCcw, Printer, Briefcase, User } from 'lucide-react';
import { CandidateInfo } from '../types';

interface HeaderProps {
  candidate: CandidateInfo | null;
  currentStep: 'setup' | 'chat' | 'report';
  onReset: () => void;
  onPrint?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ candidate, currentStep, onReset, onPrint }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Search className="w-5 h-5 text-amber-400" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                AI 情境測試偵探
                <span className="hidden sm:inline-block text-[11px] font-medium tracking-normal text-amber-400 bg-amber-950/50 border border-amber-700/50 px-2 py-0.5 rounded-full">
                  Stress-Test Detective
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              HR 招募專用 · MBTI 防偽裝與深層人格洞察系統
            </p>
          </div>
        </div>

        {/* Candidate Context Pill (if configured) */}
        {candidate && (
          <div className="hidden md:flex items-center gap-4 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-slate-100">{candidate.name}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">{candidate.jobTitle}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {currentStep === 'report' && onPrint && (
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-medium px-3.5 py-2 rounded-lg border border-slate-700 transition"
              title="列印或另存為 PDF"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">列印 / 匯出報告</span>
            </button>
          )}

          {currentStep !== 'setup' && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-slate-200 text-xs font-medium px-3 py-2 rounded-lg border border-slate-800 transition"
              title="重新測試"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">重新評估</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>AI 防作弊模式</span>
          </div>
        </div>
      </div>
    </header>
  );
};
