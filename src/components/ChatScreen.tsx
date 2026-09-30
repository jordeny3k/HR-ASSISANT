import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Search,
  User,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  FileCheck2,
  Loader2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { CandidateInfo, DialogueItem, PresetPersona } from '../types';
import { WORKPLACE_SCENARIOS } from '../data/scenarios';

interface ChatScreenProps {
  candidate: CandidateInfo;
  preset?: PresetPersona;
  onGenerateReport: (dialogue: DialogueItem[]) => void;
  isGeneratingReport: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  candidate,
  preset,
  onGenerateReport,
  isGeneratingReport,
}) => {
  const [dialogue, setDialogue] = useState<DialogueItem[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0); // 0..3 for 4 scenarios
  const [followupRound, setFollowupRound] = useState(0); // 0 = not started, 1 = round 1, 2 = round 2
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isDialogueFinished, setIsDialogueFinished] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [dialogue, isAiThinking, isDialogueFinished]);

  // Initial mount: push Scenario 1
  useEffect(() => {
    const firstScenario = WORKPLACE_SCENARIOS[0];
    const initialMessage: DialogueItem = {
      id: 'sc-1',
      sender: 'ai',
      type: 'scenario',
      scenarioId: 1,
      targetDimension: firstScenario.dimension,
      question: firstScenario.question,
      timestamp: Date.now(),
    };
    setDialogue([initialMessage]);
    setCurrentScenarioIndex(0);
  }, []);

  // Preset quick fill suggestion
  const getPresetAnswerSuggestion = () => {
    if (!preset) return '';
    if (currentScenarioIndex < 4 && followupRound === 0) {
      return preset.scenarioAnswers[currentScenarioIndex] || '';
    }
    if (followupRound > 0) {
      const idx = followupRound - 1;
      return preset.followupAnswers[idx] || preset.followupAnswers[0] || '';
    }
    return '';
  };

  const handleFillPreset = () => {
    const suggestion = getPresetAnswerSuggestion();
    if (suggestion) {
      setUserInput(suggestion);
      textareaRef.current?.focus();
    }
  };

  const handleSubmitAnswer = async () => {
    const trimmed = userInput.trim();
    if (!trimmed || isAiThinking) return;

    setUserInput('');

    // Append candidate's answer
    const currentQuestionObj = dialogue[dialogue.length - 1];
    const candidateMessage: DialogueItem = {
      id: `ans-${Date.now()}`,
      sender: 'candidate',
      type: currentQuestionObj?.type || 'scenario',
      scenarioId: currentQuestionObj?.scenarioId,
      targetDimension: currentQuestionObj?.targetDimension,
      question: currentQuestionObj?.question,
      answer: trimmed,
      timestamp: Date.now(),
    };

    const updatedDialogue = [...dialogue, candidateMessage];
    setDialogue(updatedDialogue);

    // Case A: Still answering the 4 baseline scenarios (0, 1, 2, 3)
    if (currentScenarioIndex < 3 && followupRound === 0) {
      const nextIndex = currentScenarioIndex + 1;
      setCurrentScenarioIndex(nextIndex);
      setIsAiThinking(true);

      setTimeout(() => {
        const nextSc = WORKPLACE_SCENARIOS[nextIndex];
        const nextMsg: DialogueItem = {
          id: `sc-${nextSc.id}`,
          sender: 'ai',
          type: 'scenario',
          scenarioId: nextSc.id,
          targetDimension: nextSc.dimension,
          question: nextSc.question,
          timestamp: Date.now(),
        };
        setDialogue((prev) => [...prev, nextMsg]);
        setIsAiThinking(false);
      }, 650);
      return;
    }

    // Case B: Completed the 4th scenario -> Transition to AI dynamic follow-up
    if (currentScenarioIndex === 3 && followupRound === 0) {
      setCurrentScenarioIndex(4);
      setFollowupRound(1);
      await fetchAiFollowUp(updatedDialogue, 1);
      return;
    }

    // Case C: Just answered Follow-up Round 1
    if (followupRound === 1) {
      // Check if we do round 2 or conclude
      setFollowupRound(2);
      await fetchAiFollowUp(updatedDialogue, 2);
      return;
    }

    // Case D: Completed Follow-up Round 2 -> Assessment complete!
    if (followupRound >= 2) {
      setIsDialogueFinished(true);
    }
  };

  const fetchAiFollowUp = async (currentHistory: DialogueItem[], round: number) => {
    setIsAiThinking(true);
    try {
      // Format dialogue for server
      const filtered = currentHistory
        .filter((d) => d.sender === 'candidate')
        .map((d, i) => ({
          step: i + 1,
          scenarioId: d.scenarioId,
          type: d.type,
          question: d.question || '',
          answer: d.answer || '',
        }));

      const res = await fetch('/api/detective/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate,
          dialogue: filtered,
          round,
        }),
      });

      if (!res.ok) {
        throw new Error('追問生成失敗');
      }

      const data = await res.json();

      const aiFollowUpMsg: DialogueItem = {
        id: `fu-${round}-${Date.now()}`,
        sender: 'ai',
        type: 'followup',
        targetDimension: data.targetDimension,
        question: data.question,
        rationale: data.rationale,
        timestamp: Date.now(),
      };

      setDialogue((prev) => [...prev, aiFollowUpMsg]);

      if (data.isFinalRound && round >= 2) {
        // Next answer will conclude
      }
    } catch (err) {
      console.error('Follow-up error:', err);
      // Fallback follow-up message
      const fallbackMsg: DialogueItem = {
        id: `fu-fallback-${Date.now()}`,
        sender: 'ai',
        type: 'followup',
        targetDimension: 'J/P 應變極限檢驗',
        question: `你在上一題的應對聽起來十分兼顧大局。但在應徵「${candidate.jobTitle}」時，如果核心團隊成員堅持不肯按既定方式配合，甚至引起主管高層質疑，你骨子裡會先捍衛排程規範，還是立刻放棄原則隨機變通？請誠實剖析你面對失控時的第一個本能反應。`,
        rationale: '偵測到面試修飾痕跡，進一步施壓其直覺抉擇。',
        timestamp: Date.now(),
      };
      setDialogue((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Keyboard Enter handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  // Total step progress calculation: 4 scenarios + 2 follow-ups = 6 steps
  const currentStepNumber =
    followupRound === 0 ? Math.min(currentScenarioIndex + 1, 4) : 4 + followupRound;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-4.5rem)] px-3 sm:px-6 py-4">
      {/* Top Status Bar & Breadcrumb */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 mb-3 shadow-md shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <span>{candidate.name}</span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 font-normal">{candidate.jobTitle}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {followupRound === 0
                ? `階段一：基礎職場情境 (${currentScenarioIndex + 1}/4 題)`
                : `階段二：AI 壓力追問 (${followupRound}/2 輪)`}
            </div>
          </div>
        </div>

        {/* Progress Indicator Dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all ${
                currentScenarioIndex + 1 > step
                  ? 'w-4 bg-emerald-500'
                  : currentScenarioIndex + 1 === step && followupRound === 0
                  ? 'w-6 bg-amber-400'
                  : 'w-2 bg-slate-700'
              }`}
              title={`情境題 ${step}`}
            />
          ))}
          <span className="text-slate-600 text-xs mx-0.5">/</span>
          {[1, 2].map((fu) => (
            <div
              key={`fu-${fu}`}
              className={`h-2 rounded-full transition-all ${
                followupRound > fu || isDialogueFinished
                  ? 'w-4 bg-purple-500'
                  : followupRound === fu
                  ? 'w-6 bg-purple-400 animate-pulse'
                  : 'w-2 bg-slate-700'
              }`}
              title={`壓力追問 ${fu}`}
            />
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth">
        {dialogue.map((item, idx) => {
          if (item.sender === 'ai') {
            const isFollowUp = item.type === 'followup';
            return (
              <div key={item.id || idx} className="flex items-start gap-3 max-w-[92%] sm:max-w-[85%]">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    isFollowUp
                      ? 'bg-purple-950 border border-purple-600/60 text-purple-300'
                      : 'bg-slate-900 border border-indigo-700/60 text-indigo-300'
                  }`}
                >
                  {isFollowUp ? <Zap className="w-4 h-4 text-purple-400" /> : <Search className="w-4 h-4 text-amber-400" />}
                </div>

                <div
                  className={`rounded-2xl p-4 sm:p-5 border shadow-lg ${
                    isFollowUp
                      ? 'bg-purple-950/30 border-purple-800/60 text-slate-100'
                      : 'bg-slate-900/90 border-slate-800 text-slate-100'
                  }`}
                >
                  {/* Tag Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        isFollowUp
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                          : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/50'
                      }`}
                    >
                      {isFollowUp ? 'AI 偵探犀利追問 · 壓力測試' : `職場中立情境 ${item.scenarioId}/4`}
                    </span>

                    {item.targetDimension && (
                      <span className="text-[10px] text-amber-400/90 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                        目標維度: {item.targetDimension}
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <p className="text-sm sm:text-base leading-relaxed text-slate-100 whitespace-pre-wrap">
                    {item.question}
                  </p>

                  {/* Rationale disclosure if followup */}
                  {isFollowUp && item.rationale && (
                    <div className="mt-3 pt-2.5 border-t border-purple-800/40 flex items-start gap-1.5 text-xs text-purple-300/80">
                      <ShieldAlert className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{item.rationale}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          } else {
            // Candidate answer bubble
            return (
              <div key={item.id || idx} className="flex items-start justify-end gap-3 ml-auto max-w-[92%] sm:max-w-[85%]">
                <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-800/50 text-slate-100 shadow-md">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="text-[11px] font-semibold text-indigo-300">
                      {candidate.name} 的回答
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-200 whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-300 shadow-md">
                  <User className="w-4 h-4" />
                </div>
              </div>
            );
          }
        })}

        {/* AI Typing Indicator */}
        {isAiThinking && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-700/60 flex items-center justify-center shrink-0 text-purple-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-purple-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>AI 偵探正在解構您的思維模式，識別包裝痕跡中...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Action Area: Either Chat Input or Generate Report Button */}
      <div className="pt-3 shrink-0">
        {isDialogueFinished ? (
          /* Assessment completed: prominent report generation CTA */
          <div className="bg-slate-900/95 border-2 border-amber-500/80 rounded-2xl p-5 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 pointer-events-none" />

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-700/60 px-3 py-1 rounded-full mb-3">
              <FileCheck2 className="w-4 h-4" />
              <span>壓力情境測試已完成 · 資訊蒐集充分</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              AI 偵探已完成 MBTI 八大維度交叉比對
            </h3>
            <p className="text-xs text-slate-300 max-w-lg mx-auto mb-4">
              系統已鎖定自述基線與真實收斂線之落差，立即產出偵探分析報告、誠實度紅黃綠燈與 HR 實體面試追問指南。
            </p>

            <button
              onClick={() => onGenerateReport(dialogue)}
              disabled={isGeneratingReport}
              className="inline-flex items-center justify-center gap-2.5 py-3.5 px-8 rounded-xl font-extrabold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-xl shadow-amber-950/60 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>正在繪製八向雙軌雷達圖並撰寫偵探報告...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>立即產出偵探分析報告 (Generate Report)</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Active Chat Input Area */
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl space-y-2">
            {/* Quick preset filler button if preset is active */}
            {preset && getPresetAnswerSuggestion() && (
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>範本候選人建議回答</span>
                </span>
                <button
                  type="button"
                  onClick={handleFillPreset}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-0.5 rounded-md transition"
                >
                  一鍵代入此題回答
                </button>
              </div>
            )}

            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={3}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAiThinking}
                placeholder="請輸入您在上述情境中的真實想法與應對做法 (按 Enter 直接送出，Shift+Enter 換行)..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition resize-none disabled:opacity-50"
              />
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                  {userInput.length} 字
                </span>
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={!userInput.trim() || isAiThinking}
                  className="p-2 rounded-lg bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-md"
                  title="送出回答"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>* 本測試旨在識別自然工作風格，無標準優劣答案</span>
              <span className="hidden sm:inline">第 {currentStepNumber} / 6 題</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
