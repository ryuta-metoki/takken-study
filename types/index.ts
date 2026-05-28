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
