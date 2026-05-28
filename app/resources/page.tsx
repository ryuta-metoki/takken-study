"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import {
  BookOpen,
  ExternalLink,
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Plus,
  Minus,
  ListTodo,
} from "lucide-react";
import Link from "next/link";
import { BOOKS, SCHEDULE_METHODS, type BookCategory } from "@/lib/takken-curriculum";
import type { Book } from "@/lib/takken-curriculum";
import {
  isBookSelected,
  toggleBookSelection,
  addBookTasks,
  removeBookTasks,
  getBookTasks,
} from "@/lib/storage";
import { generateTasksFromBook } from "@/lib/task-generator";

const CATEGORY_LABELS: Record<BookCategory, string> = {
  textbook: "テキスト",
  workbook: "問題集・過去問",
  mock: "予想模試",
  onepoint: "一問一答",
};

const CATEGORY_COLORS: Record<BookCategory, string> = {
  textbook: "bg-blue-100 text-blue-800",
  workbook: "bg-green-100 text-green-800",
  mock: "bg-orange-100 text-orange-800",
  onepoint: "bg-purple-100 text-purple-800",
};

const LEVEL_LABELS = {
  beginner: "初学者向け",
  standard: "標準",
  advanced: "上級者向け",
};

const LEVEL_COLORS = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  standard: "bg-yellow-50 text-yellow-700 border-yellow-200",
  advanced: "bg-red-50 text-red-700 border-red-200",
};

function BookCard({
  book,
  selected,
  taskCount,
  onToggle,
}: {
  book: Book;
  selected: boolean;
  taskCount: number;
  onToggle: (book: Book, selected: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={`transition-shadow hover:shadow-md ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className={CATEGORY_COLORS[book.category]}>
                {CATEGORY_LABELS[book.category]}
              </Badge>
              <Badge variant="outline" className={LEVEL_COLORS[book.level]}>
                {LEVEL_LABELS[book.level]}
              </Badge>
              {book.recommended && (
                <Badge className="bg-blue-600 text-white">
                  <Star className="w-3 h-3 mr-1 fill-white" />
                  おすすめ
                </Badge>
              )}
              {selected && (
                <Badge className="bg-green-600 text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  使用中
                </Badge>
              )}
            </div>
            <CardTitle className="text-sm leading-snug">{book.title}</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              {book.author}・{book.publisher}（{book.year}年版）
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 mt-1">
            {selected ? (
              <button
                onClick={() => onToggle(book, true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                <Minus className="w-3 h-3" />
                外す
              </button>
            ) : (
              <button
                onClick={() => onToggle(book, false)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              >
                <Plus className="w-3 h-3" />
                使う
              </button>
            )}
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {selected && taskCount > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <ListTodo className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs text-green-700">{taskCount}件のタスクが追加されています</span>
            <Link href="/tasks" className="text-xs text-blue-600 hover:underline ml-auto">
              タスクを見る →
            </Link>
          </div>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          <Separator />
          <p className="text-sm text-gray-700 leading-relaxed">{book.description}</p>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">強み</p>
            <ul className="space-y-1">
              {book.strengths.map((s) => (
                <li key={s} className="flex items-start gap-1.5 text-sm text-gray-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {book.officialUrl && (
            <a
              href={book.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              公式サイトで確認する
            </a>
          )}
        </CardContent>
      )}
    </Card>
  );
}

const RECOMMENDED_SET = [
  {
    phase: "Phase 1（基礎インプット）",
    color: "bg-blue-50 border-blue-200",
    books: ["tac-minna", "tac-minna-mondai"],
    note: "テキストを1章読んだら対応する問題集を解く「並行学習法」が効果的。",
  },
  {
    phase: "Phase 2（問題演習）",
    color: "bg-green-50 border-green-200",
    books: ["tac-kakomon-10"],
    note: "過去問を年度別に解いて本番感覚を養う。最低3周が目標。",
  },
  {
    phase: "Phase 3（総仕上げ）",
    color: "bg-orange-50 border-orange-200",
    books: ["tac-yoso-moshi"],
    note: "本番と同じ50問・2時間の環境で解く。",
  },
];

function ResourcesContent() {
  const defaultTab = "books";

  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [justAdded, setJustAdded] = useState<string | null>(null);

  useEffect(() => {
    const map: Record<string, boolean> = {};
    const counts: Record<string, number> = {};
    const allTasks = getBookTasks();
    for (const book of BOOKS) {
      map[book.id] = isBookSelected(book.id);
      counts[book.id] = allTasks.filter((t) => t.bookId === book.id).length;
    }
    setSelectedMap(map);
    setTaskCounts(counts);
  }, []);

  function handleToggle(book: Book, currentlySelected: boolean) {
    const nowSelected = toggleBookSelection(book.id);
    if (nowSelected) {
      const tasks = generateTasksFromBook(book);
      addBookTasks(tasks);
      setTaskCounts((prev) => ({ ...prev, [book.id]: tasks.length }));
      setJustAdded(book.id);
      setTimeout(() => setJustAdded(null), 3000);
    } else {
      removeBookTasks(book.id);
      setTaskCounts((prev) => ({ ...prev, [book.id]: 0 }));
    }
    setSelectedMap((prev) => ({ ...prev, [book.id]: nowSelected }));
  }

  const selectedCount = Object.values(selectedMap).filter(Boolean).length;
  const totalTasks = Object.values(taskCounts).reduce((s, c) => s + c, 0);

  const textbooks = BOOKS.filter((b) => b.category === "textbook");
  const workbooks = BOOKS.filter((b) => b.category === "workbook" || b.category === "onepoint");
  const mocks = BOOKS.filter((b) => b.category === "mock");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">参考書・学習法の根拠</h1>
          <p className="text-sm text-gray-500 mt-1">
            使う参考書を選ぶとタスクが自動生成されます
          </p>
        </div>
        {selectedCount > 0 && (
          <Link href="/tasks" className={buttonVariants({ size: "sm" })}>
            <ListTodo className="w-4 h-4 mr-1" />
            タスク（{totalTasks}件）
          </Link>
        )}
      </div>

      {justAdded && (
        <Card className="bg-green-50 border-green-300">
          <CardContent className="p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-800">
              タスクを{taskCounts[justAdded]}件追加しました。
              <Link href="/tasks" className="underline ml-1">タスクを確認する</Link>
            </p>
          </CardContent>
        </Card>
      )}

      {selectedCount > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                <strong>{selectedCount}冊</strong>を選択中・タスク<strong>{totalTasks}件</strong>
              </p>
              <Link href="/tasks" className="text-xs text-blue-600 hover:underline">
                タスクを管理する →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full">
          <TabsTrigger value="books" className="flex-1">
            <BookOpen className="w-4 h-4 mr-1.5" />
            参考書ガイド
          </TabsTrigger>
          <TabsTrigger value="method" className="flex-1">
            <Info className="w-4 h-4 mr-1.5" />
            スケジュールの根拠
          </TabsTrigger>
        </TabsList>

        {/* ── 参考書タブ ── */}
        <TabsContent value="books" className="space-y-6 mt-4">
          {/* おすすめセット */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                フェーズ別おすすめ教材セット
              </CardTitle>
              <p className="text-xs text-gray-600">初学者が最短距離で合格するための厳選セット</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {RECOMMENDED_SET.map((set) => {
                const setBooks = set.books.map((id) => BOOKS.find((b) => b.id === id)).filter(Boolean) as Book[];
                const allSelected = setBooks.every((b) => selectedMap[b.id]);
                return (
                  <div key={set.phase} className={`rounded-lg border p-3 ${set.color}`}>
                    <p className="text-xs font-bold text-gray-700 mb-1.5">{set.phase}</p>
                    <div className="space-y-1 mb-2">
                      {setBooks.map((b) => (
                        <div key={b.id} className="flex items-center justify-between">
                          <p className="text-sm text-gray-800">
                            ▶ {b.title}
                            <span className="text-xs text-gray-500 ml-1">（{b.publisher}）</span>
                          </p>
                          {selectedMap[b.id] ? (
                            <Badge className="bg-green-600 text-white text-xs">選択中</Badge>
                          ) : (
                            <button
                              onClick={() => handleToggle(b, false)}
                              className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full hover:bg-blue-700"
                            >
                              使う
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">💡 {set.note}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* テキスト */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-4 bg-blue-500 rounded-sm" />
              テキスト（{textbooks.length}冊）
            </h2>
            <div className="space-y-3">
              {textbooks.map((b) => (
                <BookCard
                  key={b.id}
                  book={b}
                  selected={selectedMap[b.id] ?? false}
                  taskCount={taskCounts[b.id] ?? 0}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>

          {/* 問題集 */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-4 bg-green-500 rounded-sm" />
              問題集・過去問（{workbooks.length}冊）
            </h2>
            <div className="space-y-3">
              {workbooks.map((b) => (
                <BookCard
                  key={b.id}
                  book={b}
                  selected={selectedMap[b.id] ?? false}
                  taskCount={taskCounts[b.id] ?? 0}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>

          {/* 模試 */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-4 bg-orange-500 rounded-sm" />
              予想模試（{mocks.length}冊）
            </h2>
            <div className="space-y-3">
              {mocks.map((b) => (
                <BookCard
                  key={b.id}
                  book={b}
                  selected={selectedMap[b.id] ?? false}
                  taskCount={taskCounts[b.id] ?? 0}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── スケジュール根拠タブ ── */}
        <TabsContent value="method" className="space-y-4 mt-4">
          <Card className="bg-gradient-to-br from-gray-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">このアプリのスケジュール設計について</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>複数の資格スクール・専門サイトの公開資料を統合して設計しています。</p>
              <div className="grid grid-cols-3 gap-3">
                {[["43%", "Phase 1", "基礎インプット", "blue"], ["35%", "Phase 2", "問題演習", "green"], ["22%", "Phase 3", "総仕上げ", "orange"]].map(
                  ([pct, label, sub, color]) => (
                    <div key={label} className={`bg-${color}-50 rounded-lg p-3 text-center`}>
                      <p className={`text-2xl font-bold text-${color}-600`}>{pct}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}<br />{sub}</p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {SCHEDULE_METHODS.map((method) => (
              <Card key={method.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="outline" className="mb-1.5 text-xs">{method.source}</Badge>
                      <CardTitle className="text-sm leading-snug">{method.title}</CardTitle>
                    </div>
                    {method.sourceUrl && (
                      <a href={method.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex-shrink-0 mt-1">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-sm text-gray-600 leading-relaxed">{method.description}</p>
                  <Separator />
                  <ul className="space-y-1">
                    {method.keyPoints.map((kp) => (
                      <li key={kp} className="flex items-start gap-1.5 text-xs text-gray-700">
                        <span className="text-blue-400 flex-shrink-0 mt-0.5">▶</span>
                        {kp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ResourcesPage() {
  return <ResourcesContent />;
}
