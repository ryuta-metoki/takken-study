import type {
  DrillRecord,
  DrillSession,
  GeneratedSchedule,
  StreakData,
  StudyLog,
  SubjectAccuracy,
  SubjectKey,
  UserSettings,
} from "@/types";
import { format } from "date-fns";

const KEYS = {
  SCHEDULE: "takken_schedule",
  STUDY_LOGS: "takken_study_logs",
  SETTINGS: "takken_settings",
  DRILL_RECORDS: "takken_drill_records",
  DRILL_SESSIONS: "takken_drill_sessions",
  STREAK: "takken_streak",
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

// ─── スケジュール ────────────────────────────────────────────────

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

// ─── 学習ログ ────────────────────────────────────────────────────

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

// ─── ドリル記録 ──────────────────────────────────────────────────

export function getDrillRecords(): DrillRecord[] {
  return safeGet<DrillRecord[]>(KEYS.DRILL_RECORDS) ?? [];
}

export function saveDrillRecord(record: DrillRecord): void {
  const records = getDrillRecords();
  const existing = records.findIndex((r) => r.questionId === record.questionId);
  if (existing >= 0) {
    records[existing] = record;
  } else {
    records.push(record);
  }
  safeSet(KEYS.DRILL_RECORDS, records);
}

export function getDueRecords(today: string): DrillRecord[] {
  return getDrillRecords().filter((r) => r.nextReview <= today);
}

export function getDrillSessions(): DrillSession[] {
  return safeGet<DrillSession[]>(KEYS.DRILL_SESSIONS) ?? [];
}

export function saveDrillSession(session: DrillSession): void {
  const sessions = getDrillSessions();
  sessions.push(session);
  safeSet(KEYS.DRILL_SESSIONS, sessions);
}

// ─── 分野別正答率 ────────────────────────────────────────────────

export function getSubjectAccuracies(): SubjectAccuracy[] {
  const records = getDrillRecords();
  const subjectKeys: SubjectKey[] = [
    "rights",
    "business_law",
    "regulations",
    "tax_other",
    "exemption",
  ];

  return subjectKeys.map((subject) => {
    const subRecords = records.filter((r) => r.subject === subject);
    const total = subRecords.length;
    const correct = subRecords.filter((r) => r.correct).length;
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

    // トレンド: 直近10問 vs その前10問で比較
    const recent = subRecords.slice(-10);
    const prev = subRecords.slice(-20, -10);
    const recentAcc = recent.length === 0 ? 0 : recent.filter((r) => r.correct).length / recent.length;
    const prevAcc = prev.length === 0 ? 0 : prev.filter((r) => r.correct).length / prev.length;
    const trend: "up" | "down" | "stable" =
      recentAcc > prevAcc + 0.05 ? "up" :
      recentAcc < prevAcc - 0.05 ? "down" : "stable";

    return { subject, total, correct, accuracy, trend };
  });
}

export function getAccuracyBySubject(): Record<string, number> {
  const accs = getSubjectAccuracies();
  return Object.fromEntries(accs.map((a) => [a.subject, a.accuracy]));
}

// ─── ストリーク ──────────────────────────────────────────────────

export function getStreakData(): StreakData {
  return (
    safeGet<StreakData>(KEYS.STREAK) ?? {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: "",
      totalStudyDays: 0,
    }
  );
}

export function updateStreak(): StreakData {
  const today = format(new Date(), "yyyy-MM-dd");
  const streak = getStreakData();

  if (streak.lastStudyDate === today) return streak;

  const yesterday = format(
    new Date(Date.now() - 86400000),
    "yyyy-MM-dd"
  );

  const newStreak: StreakData = {
    currentStreak:
      streak.lastStudyDate === yesterday ? streak.currentStreak + 1 : 1,
    longestStreak: Math.max(
      streak.longestStreak,
      streak.lastStudyDate === yesterday ? streak.currentStreak + 1 : 1
    ),
    lastStudyDate: today,
    totalStudyDays: streak.totalStudyDays + 1,
  };

  safeSet(KEYS.STREAK, newStreak);
  return newStreak;
}

// ─── 複合ユーティリティ ──────────────────────────────────────────

export function getTodayDueCount(): number {
  const today = format(new Date(), "yyyy-MM-dd");
  return getDueRecords(today).length;
}

export function getTotalDrillStats(): { total: number; correct: number; accuracy: number } {
  const records = getDrillRecords();
  const total = records.length;
  const correct = records.filter((r) => r.correct).length;
  return { total, correct, accuracy: total === 0 ? 0 : Math.round((correct / total) * 100) };
}
