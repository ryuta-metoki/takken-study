"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ListTodo,
} from "lucide-react";
import Link from "next/link";
import {
  getBookTasks,
  toggleTaskCompletion,
  getTaskStats,
} from "@/lib/storage";
import { SUBJECTS } from "@/lib/takken-curriculum";
import type { BookTask, TaskPhase } from "@/types";

const PHASE_LABELS: Record<TaskPhase, string> = {
  1: "Phase 1：基礎インプット",
  2: "Phase 2：問題演習",
  3: "Phase 3：総仕上げ",
};

const PHASE_COLORS: Record<TaskPhase, string> = {
  1: "bg-blue-100 text-blue-800",
  2: "bg-green-100 text-green-800",
  3: "bg-orange-100 text-orange-800",
};

const CATEGORY_LABELS = {
  textbook: "テキスト",
  workbook: "問題集・過去問",
  mock: "模試",
};

const CATEGORY_COLORS = {
  textbook: "bg-purple-100 text-purple-700",
  workbook: "bg-green-100 text-green-700",
  mock: "bg-orange-100 text-orange-700",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<BookTask[]>([]);
  const [filterPhase, setFilterPhase] = useState<TaskPhase | "all">("all");
  const [filterCompleted, setFilterCompleted] = useState<"all" | "todo" | "done">("todo");
  const [expandedBooks, setExpandedBooks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setTasks(getBookTasks());
  }, []);

  function handleToggle(taskId: string) {
    const updated = toggleTaskCompletion(taskId);
    setTasks(updated);
  }

  function toggleBook(bookId: string) {
    setExpandedBooks((prev) => ({ ...prev, [bookId]: !prev[bookId] }));
  }

  const stats = (() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const byPhase: Record<TaskPhase, { total: number; completed: number }> = {
      1: { total: 0, completed: 0 },
      2: { total: 0, completed: 0 },
      3: { total: 0, completed: 0 },
    };
    for (const t of tasks) {
      byPhase[t.phase].total++;
      if (t.completed) byPhase[t.phase].completed++;
    }
    return { total, completed, byPhase };
  })();

  const filtered = tasks
    .filter((t) => filterPhase === "all" || t.phase === filterPhase)
    .filter((t) =>
      filterCompleted === "all" ? true : filterCompleted === "todo" ? !t.completed : t.completed
    )
    .sort((a, b) => a.phase - b.phase || a.order - b.order);

  // 参考書ごとにグループ化
  const bookGroups = filtered.reduce<Record<string, { bookId: string; bookTitle: string; bookCategory: BookTask["bookCategory"]; tasks: BookTask[] }>>(
    (acc, task) => {
      if (!acc[task.bookId]) {
        acc[task.bookId] = {
          bookId: task.bookId,
          bookTitle: task.bookTitle,
          bookCategory: task.bookCategory,
          tasks: [],
        };
      }
      acc[task.bookId].tasks.push(task);
      return acc;
    },
    {}
  );

  const totalMinutesLeft = filtered
    .filter((t) => !t.completed)
    .reduce((s, t) => s + t.estimatedMinutes, 0);

  if (tasks.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">タスク管理</h1>
          <p className="text-sm text-gray-500 mt-1">参考書を選択するとタスクが自動生成されます</p>
        </div>
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-8 text-center">
            <ListTodo className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              タスクがまだありません
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              参考書ページで使う参考書を選択するとタスクが自動生成されます
            </p>
            <Link href="/resources?tab=books" className={buttonVariants()}>
              参考書を選択する
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">タスク管理</h1>
          <p className="text-sm text-gray-500 mt-1">参考書ベースの学習タスク</p>
        </div>
        <Link href="/resources?tab=books" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <BookOpen className="w-4 h-4 mr-1" />
          参考書を変更
        </Link>
      </div>

      {/* 全体進捗 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">全体の進捗</span>
            <span className="text-sm font-bold text-blue-600">
              {stats.completed} / {stats.total} タスク完了
            </span>
          </div>
          <Progress
            value={stats.total === 0 ? 0 : (stats.completed / stats.total) * 100}
            className="h-3 mb-3"
          />
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as TaskPhase[]).map((phase) => {
              const p = stats.byPhase[phase];
              return (
                <div key={phase} className="text-center">
                  <Badge className={`${PHASE_COLORS[phase]} text-xs mb-1`}>
                    P{phase}
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {p.completed}/{p.total}
                  </p>
                  <Progress
                    value={p.total === 0 ? 0 : (p.completed / p.total) * 100}
                    className="h-1 mt-1"
                  />
                </div>
              );
            })}
          </div>
          {totalMinutesLeft > 0 && (
            <p className="text-xs text-gray-400 mt-2 text-right">
              残り予定時間：約{Math.floor(totalMinutesLeft / 60)}時間{totalMinutesLeft % 60}分
            </p>
          )}
        </CardContent>
      </Card>

      {/* フィルター */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1">
          {(["all", 1, 2, 3] as const).map((phase) => (
            <button
              key={phase}
              onClick={() => setFilterPhase(phase as TaskPhase | "all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterPhase === phase
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {phase === "all" ? "全て" : `Phase ${phase}`}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["todo", "all", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterCompleted(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterCompleted === f
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "todo" ? "未完了" : f === "done" ? "完了" : "全部"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-8 text-sm">
          {filterCompleted === "done" ? "まだ完了したタスクがありません" : "全て完了！"}
        </p>
      ) : (
        <div className="space-y-4">
          {Object.values(bookGroups).map((group) => {
            const isExpanded = expandedBooks[group.bookId] !== false; // デフォルトは開く
            const groupDone = group.tasks.filter((t) => t.completed).length;

            return (
              <Card key={group.bookId}>
                <CardHeader
                  className="pb-2 cursor-pointer"
                  onClick={() => toggleBook(group.bookId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge className={CATEGORY_COLORS[group.bookCategory]}>
                        {CATEGORY_LABELS[group.bookCategory]}
                      </Badge>
                      <CardTitle className="text-sm truncate">{group.bookTitle}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {groupDone}/{group.tasks.length}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <Progress
                    value={group.tasks.length === 0 ? 0 : (groupDone / group.tasks.length) * 100}
                    className="h-1"
                  />
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {group.tasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => handleToggle(task.id)}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${
                            task.completed
                              ? "bg-gray-50 opacity-60"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                              <Badge className={`${PHASE_COLORS[task.phase]} text-xs py-0`}>
                                P{task.phase}
                              </Badge>
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: SUBJECTS[task.subject].color }}
                              />
                              <span className={`text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                                {task.title}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{task.description}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 text-xs text-gray-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {task.estimatedMinutes}分
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
