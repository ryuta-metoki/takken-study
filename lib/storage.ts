import type {
  BookTask,
  DrillRecord,
  DrillSession,
  GeneratedSchedule,
  SelectedBook,
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
  SELECTED_BOOKS: "takken_selected_books",
  BOOK_TASKS: "takken_book_tasks",
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

// ─── 参考書選択 ──────────────────────────────────────────────────

export function getSelectedBooks(): SelectedBook[] {
  return safeGet<SelectedBook[]>(KEYS.SELECTED_BOOKS) ?? [];
}

export function isBookSelected(bookId: string): boolean {
  return getSelectedBooks().some((b) => b.bookId === bookId);
}

export function toggleBookSelection(bookId: string): boolean {
  const selected = getSelectedBooks();
  const exists = selected.findIndex((b) => b.bookId === bookId);
  if (exists >= 0) {
    selected.splice(exists, 1);
    safeSet(KEYS.SELECTED_BOOKS, selected);
    return false;
  } else {
    selected.push({ bookId, selectedAt: new Date().toISOString() });
    safeSet(KEYS.SELECTED_BOOKS, selected);
    return true;
  }
}

// ─── タスク管理 ──────────────────────────────────────────────────

export function getBookTasks(): BookTask[] {
  return safeGet<BookTask[]>(KEYS.BOOK_TASKS) ?? [];
}

export function saveBookTasks(tasks: BookTask[]): void {
  safeSet(KEYS.BOOK_TASKS, tasks);
}

export function addBookTasks(newTasks: BookTask[]): void {
  const existing = getBookTasks();
  // 同じbookIdのタスクは上書き
  const filtered = existing.filter((t) => !newTasks.some((n) => n.bookId === t.bookId));
  safeSet(KEYS.BOOK_TASKS, [...filtered, ...newTasks]);
}

export function removeBookTasks(bookId: string): void {
  const tasks = getBookTasks().filter((t) => t.bookId !== bookId);
  safeSet(KEYS.BOOK_TASKS, tasks);
}

export function toggleTaskCompletion(taskId: string): BookTask[] {
  const tasks = getBookTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx >= 0) {
    tasks[idx] = {
      ...tasks[idx],
      completed: !tasks[idx].completed,
      completedAt: !tasks[idx].completed ? new Date().toISOString() : undefined,
    };
  }
  safeSet(KEYS.BOOK_TASKS, tasks);
  return tasks;
}

export function getTaskStats(): { total: number; completed: number; byPhase: Record<number, { total: number; completed: number }> } {
  const tasks = getBookTasks();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const byPhase: Record<number, { total: number; completed: number }> = { 1: { total: 0, completed: 0 }, 2: { total: 0, completed: 0 }, 3: { total: 0, completed: 0 } };
  for (const t of tasks) {
    byPhase[t.phase].total++;
    if (t.completed) byPhase[t.phase].completed++;
  }
  return { total, completed, byPhase };
}

export function getTodayTasks(limit = 5): BookTask[] {
  return getBookTasks()
    .filter((t) => !t.completed)
    .sort((a, b) => a.phase - b.phase || a.order - b.order)
    .slice(0, limit);
}
