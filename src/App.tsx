import React, { useState } from 'react';
import { CandidateInfo, DetectiveReport, DialogueItem, PresetPersona } from './types';
import { Header } from './components/Header';
import { CandidateSetup } from './components/CandidateSetup';
import { ChatScreen } from './components/ChatScreen';
import { ReportScreen } from './components/ReportScreen';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [activePreset, setActivePreset] = useState<PresetPersona | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState<'setup' | 'chat' | 'report'>('setup');
  const [report, setReport] = useState<DetectiveReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartAssessment = (info: CandidateInfo, preset?: PresetPersona) => {
    setCandidate(info);
    setActivePreset(preset);
    setCurrentStep('chat');
    setErrorMsg(null);
  };

  const handleGenerateReport = async (dialogue: DialogueItem[]) => {
    if (!candidate) return;
    setIsGeneratingReport(true);
    setErrorMsg(null);

    try {
      const filtered = dialogue
        .filter((d) => d.sender === 'candidate')
        .map((d, i) => ({
          step: i + 1,
          scenarioId: d.scenarioId,
          type: d.type,
          question: d.question || '',
          answer: d.answer || '',
        }));

      const res = await fetch('/api/detective/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate,
          dialogue: filtered,
        }),
      });

      if (!res.ok) {
        throw new Error('無法產出偵探分析報告，請稍候重試');
      }

      const data: DetectiveReport = await res.json();
      setReport(data);
      setCurrentStep('report');
    } catch (err) {
      console.error('Report error:', err);
      setErrorMsg(err instanceof Error ? err.message : '產出報告時發生異常');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleReset = () => {
    setCandidate(null);
    setActivePreset(undefined);
    setReport(null);
    setCurrentStep('setup');
    setErrorMsg(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-400 selection:text-slate-950">
      {/* Top Header */}
      <Header
        candidate={candidate}
        currentStep={currentStep}
        onReset={handleReset}
        onPrint={currentStep === 'report' ? handlePrint : undefined}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {errorMsg && (
          <div className="max-w-4xl mx-auto mt-4 px-4">
            <div className="p-4 bg-rose-950/80 border border-rose-700 rounded-xl text-xs text-rose-200 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-xs underline text-rose-300 hover:text-white"
              >
                關閉
              </button>
            </div>
          </div>
        )}

        {currentStep === 'setup' && <CandidateSetup onStart={handleStartAssessment} />}

        {currentStep === 'chat' && candidate && (
          <ChatScreen
            candidate={candidate}
            preset={activePreset}
            onGenerateReport={handleGenerateReport}
            isGeneratingReport={isGeneratingReport}
          />
        )}

        {currentStep === 'report' && report && candidate && (
          <ReportScreen report={report} candidate={candidate} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}
