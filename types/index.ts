export type SubjectKey =
  | "rights"
  | "business_law"
  | "regulations"
  | "tax_other"
  | "exemption";

export interface Subject {
  key: SubjectKey;
  name: string;
  questions: number;
  totalHours: number;
  color: string;
  topics: string[];
}

export interface StudyPhase {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  subjects: SubjectKey[];
}

export interface DailySchedule {
  date: string;
  subject: SubjectKey;
  topic: string;
  targetMinutes: number;
  phaseId: number;
}

export interface StudyLog {
  date: string;
  subject: SubjectKey;
  topic: string;
  actualMinutes: number;
  memo?: string;
  completedAt: string;
}

export interface SubjectProgress {
  subject: SubjectKey;
  completedHours: number;
  totalHours: number;
  percentage: number;
}

export interface UserSettings {
  examDate: string;
  dailyMinutes: number;
  studyDays: number[];
  startDate: string;
}

export interface GeneratedSchedule {
  phases: StudyPhase[];
  dailySchedules: DailySchedule[];
  totalDays: number;
  totalHours: number;
  settings: UserSettings;
  generatedAt: string;
}

// ─── ドリル・一問一答 ────────────────────────────────────────────

export type DrillQuality = 0 | 1 | 2 | 3 | 4 | 5;
// SM-2スケール: 0=完全な誤り, 3=正解(難しい), 4=正解(普通), 5=正解(簡単)

export interface QuizQuestion {
  id: string;
  subject: SubjectKey;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface DrillRecord {
  questionId: string;
  subject: SubjectKey;
  topic: string;
  question: string;
  correct: boolean;
  quality: DrillQuality;
  answeredAt: string;
  // SRS fields
  interval: number;       // 次回出題までの日数
  easeFactor: number;     // 難易度係数 (初期 2.5)
  repetitions: number;    // 正解連続回数
  nextReview: string;     // 次回出題日 (ISO date)
}

export interface DrillSession {
  date: string;
  subject: SubjectKey | "all";
  total: number;
  correct: number;
  durationSeconds: number;
  completedAt: string;
}

// ─── ストリーク ──────────────────────────────────────────────────

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  totalStudyDays: number;
}

// ─── 弱点分析 ────────────────────────────────────────────────────

export interface SubjectAccuracy {
  subject: SubjectKey;
  total: number;
  correct: number;
  accuracy: number;       // 0-100
  trend: "up" | "down" | "stable";
}
