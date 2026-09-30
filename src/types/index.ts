export interface CandidateInfo {
  name: string;
  jobTitle: string;
}

export interface ScenarioQuestion {
  id: number;
  dimension: 'E/I' | 'S/N' | 'T/F' | 'J/P';
  title: string;
  subTitle: string;
  question: string;
  evaluates: string;
}

export interface DialogueItem {
  id: string;
  sender: 'ai' | 'candidate';
  type: 'scenario' | 'followup' | 'system';
  scenarioId?: number;
  targetDimension?: string;
  question?: string;
  answer?: string;
  text?: string;
  rationale?: string;
  timestamp: number;
}

export interface HonestyAlert {
  status: 'green' | 'yellow' | 'red';
  score: number;
  label: string;
  summary: string;
}

export interface DimensionScore {
  baseline: number;
  converged: number;
}

export interface RadarData {
  E: DimensionScore;
  I: DimensionScore;
  S: DimensionScore;
  N: DimensionScore;
  T: DimensionScore;
  F: DimensionScore;
  J: DimensionScore;
  P: DimensionScore;
  greatestGapDimension: string;
  gapExplanation: string;
}

export interface ProminentTrait {
  dimension: string;
  scoreText: string;
  behavior: string;
  teamRole: string;
  communication: string;
}

export interface PackagingAnalysis {
  detectedExaggeration: string;
  pressureRevealed: string;
  recruitmentRiskWarning: string;
}

export interface HrFollowUpGuide {
  question: string;
  purpose: string;
  whatToListenFor: {
    authenticSign: string;
    fakeSign: string;
  };
}

export interface DetectiveReport {
  mbti: string;
  mbtiTitle: string;
  mbtiSummary: string;
  honestyAlert: HonestyAlert;
  radarData: RadarData;
  prominentTraits: ProminentTrait[];
  packagingAnalysis: PackagingAnalysis;
  hrFollowUpGuide: HrFollowUpGuide;
}

export interface PresetPersona {
  id: string;
  label: string;
  candidateName: string;
  jobTitle: string;
  badge: string;
  description: string;
  scenarioAnswers: string[];
  followupAnswers: string[];
}
