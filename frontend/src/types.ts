export type Difficulty = "Debutant" | "Intermediaire" | "Avance" | "Pentest";
export type QuestionType = "mcq" | "true_false" | "matching" | "calculation";

export interface QuizQuestion {
  type?: QuestionType;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface TopologyNode {
  id: string;
  label: string;
  type: "host" | "switch" | "router" | "server" | "firewall" | "internet";
}

export interface TopologyLink {
  source: string;
  target: string;
  label: string;
}

export interface Lesson {
  id: string;
  level: number;
  levelName: string;
  moduleNumber: string;
  lessonNumber: number;
  title: string;
  module: string;
  difficulty: Difficulty;
  duration: string;
  xp: number;
  resources: string[];
  labType: string;
  objectives: string[];
  theory: string[];
  commands: string[];
  labPrompt: string;
  starterCode: string;
  quiz: QuizQuestion[];
  topology: {
    nodes: TopologyNode[];
    links: TopologyLink[];
  };
}

export interface ProgressRow {
  lesson_id: string;
  completed: 0 | 1;
  score: number;
  updated_at: string;
}

export interface LabProgressRow {
  lesson_id: string;
  completed: 0 | 1;
  evidence: string;
  updated_at: string;
}

export interface QuizAttemptRow {
  id: number;
  lesson_id: string;
  score: number;
  passed: 0 | 1;
  answers: string;
  created_at: string;
}

export interface MissionStep {
  title: string;
  objective: string;
  expectedEvidence: string;
  mentorHints: string[];
  commands: string[];
  commonMistake: string;
  validation: string;
}

export interface Mission {
  id: string;
  title: string;
  level: "Fondation" | "Intermediaire" | "Avance" | "Pentest encadre";
  duration: string;
  scenario: string;
  scope: string[];
  rules: string[];
  skills: string[];
  assets: string[];
  steps: MissionStep[];
  finalReport: {
    executiveSummary: string;
    technicalFindings: string[];
    remediation: string[];
  };
}

export interface MissionEvidenceRow {
  mission_id: string;
  step_index: number;
  observation: string;
  command: string;
  interpretation: string;
  risk: string;
  remediation: string;
  completed: 0 | 1;
  updated_at: string;
}
