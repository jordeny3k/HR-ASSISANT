import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  Compass,
  Briefcase,
  User,
  Printer,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Target,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { DetectiveReport, CandidateInfo } from '../types';
import { RadarChart } from './RadarChart';

interface ReportScreenProps {
  report: DetectiveReport;
  candidate: CandidateInfo;
  onReset: () => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({ report, candidate, onReset }) => {
  const { mbti, mbtiTitle, mbtiSummary, honestyAlert, radarData, prominentTraits, packagingAnalysis, hrFollowUpGuide } =
    report;

  const handlePrint = () => {
    window.print();
  };

  // Honesty light badge styling
  const getTrafficLightBadge = () => {
    switch (honestyAlert.status) {
      case 'green':
        return {
          bg: 'bg-emerald-950/60',
          border: 'border-emerald-500/80',
          text: 'text-emerald-300',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          lightBg: 'bg-emerald-500',
          glow: 'shadow-emerald-500/50',
        };
      case 'yellow':
        return {
          bg: 'bg-amber-950/60',
          border: 'border-amber-500/80',
          text: 'text-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          lightBg: 'bg-amber-400',
          glow: 'shadow-amber-400/50',
        };
      case 'red':
      default:
        return {
          bg: 'bg-rose-950/60',
          border: 'border-rose-500/80',
          text: 'text-rose-300',
          icon: <XCircle className="w-5 h-5 text-rose-400" />,
          lightBg: 'bg-rose-500',
          glow: 'shadow-rose-500/50',
        };
    }
  };

  const alertBadge = getTrafficLightBadge();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 print:p-0 print:space-y-6">
      {/* Top Dossier Title Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden print:border-slate-300 print:bg-white print:text-black">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5 print:border-slate-300">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono tracking-widest text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded font-bold uppercase print:text-black print:bg-slate-100">
                CONFIDENTIAL HR ASSESSMENT REPORT
              </span>
              <span className="text-xs text-slate-400 print:text-slate-600">
                評估日期: {new Date().toLocaleDateString('zh-TW')}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 print:text-black">
              偵探分析結果報告
              <span className="text-sm font-normal text-slate-400 hidden sm:inline print:text-slate-600">
                / MBTI 防偽裝交叉比對
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>列印 / 匯出 PDF</span>
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 bg-indigo-950 hover:bg-indigo-900 active:scale-95 text-indigo-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-indigo-700/60 transition shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重新測試</span>
            </button>
          </div>
        </div>

        {/* Candidate Profile Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center gap-3 print:bg-slate-50 print:border-slate-300">
            <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">求職者姓名 / 代號</span>
              <span className="font-bold text-slate-100 text-sm print:text-black">{candidate.name}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center gap-3 print:bg-slate-50 print:border-slate-300">
            <div className="w-9 h-9 rounded-lg bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">應徵關鍵職缺</span>
              <span className="font-bold text-slate-100 text-sm print:text-black">{candidate.jobTitle}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center gap-3 print:bg-slate-50 print:border-slate-300">
            <div className="w-9 h-9 rounded-lg bg-purple-950 border border-purple-700/50 flex items-center justify-center text-purple-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">判定真實 MBTI</span>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-amber-400 font-mono text-base print:text-black">
                  {mbti}
                </span>
                <span className="text-slate-300 text-xs print:text-slate-700 font-medium">({mbtiTitle})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Honesty Traffic Light & Confidence Index */}
      <div className={`p-6 rounded-2xl border shadow-xl ${alertBadge.bg} ${alertBadge.border} print:border-slate-400 print:bg-white`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Traffic Light Visual + Verdict */}
          <div className="flex items-start gap-4">
            {/* Realistic 3-Light Box */}
            <div className="w-10 bg-slate-950 border border-slate-700 rounded-full p-2 flex flex-col items-center gap-2 shrink-0 shadow-inner">
              <span
                className={`w-5 h-5 rounded-full transition-all ${
                  honestyAlert.status === 'red'
                    ? 'bg-rose-500 shadow-md shadow-rose-500/80'
                    : 'bg-slate-800 opacity-40'
                }`}
                title="紅燈：高度刻意偽裝/嚴重前後矛盾"
              />
              <span
                className={`w-5 h-5 rounded-full transition-all ${
                  honestyAlert.status === 'yellow'
                    ? 'bg-amber-400 shadow-md shadow-amber-400/80 animate-pulse'
                    : 'bg-slate-800 opacity-40'
                }`}
                title="黃燈：中度包裝修飾/迎合職缺"
              />
              <span
                className={`w-5 h-5 rounded-full transition-all ${
                  honestyAlert.status === 'green'
                    ? 'bg-emerald-500 shadow-md shadow-emerald-500/80'
                    : 'bg-slate-800 opacity-40'
                }`}
                title="綠燈：真實度高/前後一致"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-base sm:text-lg font-bold ${alertBadge.text} print:text-black`}>
                  誠實度判定：{honestyAlert.label}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed max-w-2xl print:text-slate-700">
                {honestyAlert.summary}
              </p>
            </div>
          </div>

          {/* Confidence Score Pill */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center shrink-0 min-w-[160px] print:bg-slate-50 print:border-slate-300">
            <span className="text-[11px] text-slate-400 block mb-0.5">真實度信任指數</span>
            <div className="text-3xl font-extrabold font-mono text-white print:text-black">
              {honestyAlert.score}
              <span className="text-base text-slate-400 font-sans ml-0.5">%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full ${
                  honestyAlert.status === 'green'
                    ? 'bg-emerald-400'
                    : honestyAlert.status === 'yellow'
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(5, Math.min(100, honestyAlert.score))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Dual Radar Chart & MBTI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Radar Chart (Left 7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between print:border-slate-300 print:bg-white">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white print:text-black">
                  MBTI 八大屬性雙軌雷達圖
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">8-Dimension Convergence</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 print:text-slate-600">
              對比「初始基線 (面試想呈現的包裝)」與「壓力收斂線 (AI 犀利追問後露出的本能)」，折線重疊度愈低代表偽裝程度愈高。
            </p>
          </div>

          <RadarChart radarData={radarData} honestyStatus={honestyAlert.status} />

          {/* Greatest Gap Dimension Callout */}
          <div className="mt-5 p-3.5 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-200/90 flex items-start gap-2.5 print:bg-amber-50 print:border-amber-300 print:text-black">
            <TrendingDown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5 print:text-amber-900">
                最大包裝落差維度：{radarData.greatestGapDimension}
              </span>
              <p className="text-[11px] text-slate-300 print:text-slate-700 leading-relaxed">
                {radarData.gapExplanation}
              </p>
            </div>
          </div>
        </div>

        {/* MBTI Archetype & Behavioral Breakdown (Right 5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* MBTI Core Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl print:border-slate-300 print:bg-white">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white print:text-black">真實性格總結</h3>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl mb-4 print:bg-slate-50 print:border-slate-300">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-400 print:text-black">
                  {mbti}
                </span>
                <span className="text-xs font-semibold text-slate-300 print:text-slate-700">
                  {mbtiTitle}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed print:text-slate-700">
                {mbtiSummary}
              </p>
            </div>

            {/* Prominent Traits Breakdown */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 block print:text-slate-800">
                核心顯著維度特徵：
              </span>
              {prominentTraits.map((trait, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl text-xs space-y-1.5 print:bg-slate-50 print:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 print:text-indigo-800">
                      {trait.dimension}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{trait.scoreText}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 print:text-slate-700">
                    <span className="text-slate-400">工作特徵：</span>
                    {trait.behavior}
                  </p>
                  <p className="text-[11px] text-slate-300 print:text-slate-700">
                    <span className="text-slate-400">團隊風格：</span>
                    {trait.teamRole}
                  </p>
                  <p className="text-[11px] text-slate-300 print:text-slate-700">
                    <span className="text-slate-400">溝通偏好：</span>
                    {trait.communication}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: 「需要關注可能的包裝」防偽解析 (CORE MVP HIGHLIGHT) */}
      <div className="bg-slate-900/90 border-2 border-indigo-700/60 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden print:border-slate-400 print:bg-white">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-600/50 flex items-center justify-center text-indigo-400">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white print:text-black">
              需要關注可能的包裝 · 防偽解析
            </h3>
            <p className="text-xs text-slate-400 print:text-slate-600">
              AI 偵探深度解構：面試自述與壓力追問下的關鍵矛盾點
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Packaging Box */}
          <div className="p-4 bg-slate-950/70 border border-indigo-900/50 rounded-xl space-y-2 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300 print:text-indigo-900">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>刻意修飾之包裝面</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs print:text-slate-800">
              {packagingAnalysis.detectedExaggeration}
            </p>
          </div>

          {/* Pressure Reality Box */}
          <div className="p-4 bg-slate-950/70 border border-amber-900/50 rounded-xl space-y-2 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 print:text-amber-900">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>壓力追問露出之真實本能</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs print:text-slate-800">
              {packagingAnalysis.pressureRevealed}
            </p>
          </div>

          {/* Recruitment Risk Warning Box */}
          <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl space-y-2 print:bg-rose-50 print:border-rose-300">
            <div className="flex items-center gap-1.5 font-bold text-rose-300 print:text-rose-900">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>HR 招募與組織管理警示</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs print:text-slate-800">
              {packagingAnalysis.recruitmentRiskWarning}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: HR 專用「面試追問指南」 */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl print:border-slate-300 print:bg-white">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white print:text-black">
                HR 專用「實體面試追問指南」
              </h3>
              <p className="text-xs text-slate-400 print:text-slate-600">
                供 HR 主試官在實體面試或二次複試時直接對質與交叉檢驗
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md hidden sm:inline">
            INTERVIEW GUIDE
          </span>
        </div>

        {/* The Question Card */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/30 via-slate-950/80 to-indigo-950/30 border border-amber-700/50 rounded-xl mb-4 print:border-amber-300 print:bg-slate-50">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
            推薦提問題目 (Targeted Interview Question)
          </span>
          <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed print:text-black">
            {hrFollowUpGuide.question}
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-start gap-1.5 text-xs text-slate-400 print:text-slate-600">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-300 print:text-slate-800">檢驗目的：</strong>
              {hrFollowUpGuide.purpose}
            </span>
          </div>
        </div>

        {/* What to listen for (Side by side comparison) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Authentic Sign */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-1.5 print:bg-emerald-50 print:border-emerald-300">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 print:text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>真實/適任的回答訊號 (Authentic Signals)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px] print:text-slate-700">
              {hrFollowUpGuide.whatToListenFor.authenticSign}
            </p>
          </div>

          {/* Fake Sign */}
          <div className="p-4 bg-rose-950/20 border border-rose-800/40 rounded-xl space-y-1.5 print:bg-rose-50 print:border-rose-300">
            <div className="flex items-center gap-1.5 font-bold text-rose-400 print:text-rose-900">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>持續包裝/狡辯的紅旗警訊 (Red Flags)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px] print:text-slate-700">
              {hrFollowUpGuide.whatToListenFor.fakeSign}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Action */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 print:hidden">
        <span>* 本報告供招募決策內部參考，建議結合履歷專案成果進行綜合評估。</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 cursor-pointer"
          >
            列印本頁 / 存為 PDF
          </button>
        </div>
      </div>
    </div>
  );
};
