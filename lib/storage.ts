import type { GeneratedSchedule, StudyLog, UserSettings } from "@/types";

const KEYS = {
  SCHEDULE: "takken_schedule",
  STUDY_LOGS: "takken_study_logs",
  SETTINGS: "takken_settings",
} as const;

function safeGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getSchedule(): GeneratedSchedule | null {
  return safeGet<GeneratedSchedule>(KEYS.SCHEDULE);
}

export function saveSchedule(schedule: GeneratedSchedule): void {
  safeSet(KEYS.SCHEDULE, schedule);
}

export function clearSchedule(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.SCHEDULE);
}

export function getStudyLogs(): StudyLog[] {
  return safeGet<StudyLog[]>(KEYS.STUDY_LOGS) ?? [];
}

export function addStudyLog(log: StudyLog): void {
  const logs = getStudyLogs();
  logs.push(log);
  safeSet(KEYS.STUDY_LOGS, logs);
}

export function getStudyLogsByDate(date: string): StudyLog[] {
  return getStudyLogs().filter((l) => l.date === date);
}

export function getTotalMinutesBySubject(subject: string): number {
  return getStudyLogs()
    .filter((l) => l.subject === subject)
    .reduce((sum, l) => sum + l.actualMinutes, 0);
}

export function getSettings(): UserSettings | null {
  return safeGet<UserSettings>(KEYS.SETTINGS);
}

export function saveSettings(settings: UserSettings): void {
  safeSet(KEYS.SETTINGS, settings);
}
