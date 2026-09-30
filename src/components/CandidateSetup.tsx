import React, { useState } from 'react';
import { User, Briefcase, ArrowRight, Sparkles, ShieldAlert, Target, Compass, CheckCircle } from 'lucide-react';
import { CandidateInfo, PresetPersona } from '../types';
import { PRESET_PERSONAS } from '../data/scenarios';

interface CandidateSetupProps {
  onStart: (info: CandidateInfo, preset?: PresetPersona) => void;
}

export const CandidateSetup: React.FC<CandidateSetupProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<PresetPersona | null>(null);

  const handlePresetSelect = (preset: PresetPersona) => {
    setSelectedPreset(preset);
    setName(preset.candidateName);
    setJobTitle(preset.jobTitle);
  };

  const handleCustomStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !jobTitle.trim()) return;
    onStart({ name: name.trim(), jobTitle: jobTitle.trim() }, selectedPreset || undefined);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Badge & Introduction */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs px-3.5 py-1.5 rounded-full font-medium shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>破解面試偽裝 · 拒絕洗分數與背答案</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI 情境測試偵探
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-300 to-indigo-400 mt-1">
            短時間看透求職者真實人格與防偽裝報告
          </span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          招募關鍵職缺最怕錄取到「面試包裝完美、入職實際不適任」的人選。
          本系統先拋出 4 題中立職場黃金情境，隨後由 AI 偵探展開 1-2 輪針對性犀利追問，
          透過雙軌八向雷達圖直擊自述與真實本能落差。
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-5">
            <Target className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">受測者基本資料登記</h3>
          </div>

          <form onSubmit={handleCustomStart} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                求職者姓名 / 代號 <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (selectedPreset && selectedPreset.candidateName !== e.target.value) {
                      setSelectedPreset(null);
                    }
                  }}
                  placeholder="例如：陳冠宇、Candidate A"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                應徵職缺名稱 <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                    if (selectedPreset && selectedPreset.jobTitle !== e.target.value) {
                      setSelectedPreset(null);
                    }
                  }}
                  placeholder="例如：資深產品總監、首席架構師、行銷經理"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                AI 偵探將依據此職缺特質，自動鎖定面試者可能刻意「迎合或包裝」的關鍵人格維度。
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!name.trim() || !jobTitle.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-lg shadow-amber-950/40 active:scale-[0.98] transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <span>進入 4 題情境與 AI 壓力追問</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Workflow 3-Step Preview */}
          <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] text-amber-400 font-mono font-bold block">STEP 1</span>
              <span className="text-xs font-medium text-slate-200 block mt-0.5">4 題黃金情境</span>
              <span className="text-[10px] text-slate-400 block">建立初始自述基線</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] text-purple-400 font-mono font-bold block">STEP 2</span>
              <span className="text-xs font-medium text-slate-200 block mt-0.5">AI 犀利追問</span>
              <span className="text-[10px] text-slate-400 block">針對官腔壓力收斂</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] text-emerald-400 font-mono font-bold block">STEP 3</span>
              <span className="text-xs font-medium text-slate-200 block mt-0.5">偵探分析報告</span>
              <span className="text-[10px] text-slate-400 block">雙軌八向雷達圖</span>
            </div>
          </div>
        </div>

        {/* Right: Fast Presets for Evaluator/HR */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>快速體驗範本 (一鍵試用)</span>
            </div>
            <span className="text-[11px] text-slate-400">專供 HR 評測系統成效</span>
          </div>

          <div className="space-y-2.5">
            {PRESET_PERSONAS.map((preset) => {
              const isSelected = selectedPreset?.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        {preset.label}
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-indigo-400 inline" />}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {preset.candidateName} · {preset.jobTitle}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium whitespace-nowrap ${
                        preset.id === 'packaged-pm'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                          : preset.id === 'authentic-analyst'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                      }`}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400">
            <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              選擇範本後將自動帶入該受測者的全套典型回答，方便 HR 直接觀察「AI 犀利反問」與「雙軌八向雷達圖」的落差效果。
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
