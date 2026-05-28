"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  ExternalLink,
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { BOOKS, SCHEDULE_METHODS, type BookCategory } from "@/lib/takken-curriculum";
import type { Book } from "@/lib/takken-curriculum";

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

function BookCard({ book }: { book: Book }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={`transition-shadow hover:shadow-md ${
        book.recommended ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <CardHeader
        className="pb-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className={CATEGORY_COLORS[book.category]}>
                {CATEGORY_LABELS[book.category]}
              </Badge>
              <Badge
                variant="outline"
                className={LEVEL_COLORS[book.level]}
              >
                {LEVEL_LABELS[book.level]}
              </Badge>
              {book.recommended && (
                <Badge className="bg-blue-600 text-white">
                  <Star className="w-3 h-3 mr-1 fill-white" />
                  おすすめ
                </Badge>
              )}
            </div>
            <CardTitle className="text-sm leading-snug">{book.title}</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              {book.author}・{book.publisher}（{book.year}年版）
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 mt-1">
            <span className="text-xs text-gray-400">#{book.rank}</span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
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
    note:
      "テキストを1章読んだら対応する問題集を解く「並行学習法」が効果的。1日60分で1トピックを消化。",
  },
  {
    phase: "Phase 2（問題演習）",
    color: "bg-green-50 border-green-200",
    books: ["tac-kakomon-10"],
    note:
      "過去問を年度別に解いて本番感覚を養う。間違えた問題はテキストに戻って確認。最低3周が目標。",
  },
  {
    phase: "Phase 3（総仕上げ）",
    color: "bg-orange-50 border-orange-200",
    books: ["tac-yoso-moshi"],
    note:
      "本番と同じ50問・2時間の環境で解く。点数よりも時間配分と弱点発見を目的にする。",
  },
];

export default function ResourcesPage() {
  const textbooks = BOOKS.filter((b) => b.category === "textbook");
  const workbooks = BOOKS.filter(
    (b) => b.category === "workbook" || b.category === "onepoint"
  );
  const mocks = BOOKS.filter((b) => b.category === "mock");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">参考書・学習法の根拠</h1>
        <p className="text-sm text-gray-500 mt-1">
          定番参考書の一覧と、このアプリのスケジュール設計の根拠
        </p>
      </div>

      <Tabs defaultValue="books">
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
              <p className="text-xs text-gray-600">
                初学者が最短距離で合格するための厳選セット
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {RECOMMENDED_SET.map((set) => {
                const setBooks = set.books.map((id) =>
                  BOOKS.find((b) => b.id === id)
                ).filter(Boolean) as Book[];
                return (
                  <div
                    key={set.phase}
                    className={`rounded-lg border p-3 ${set.color}`}
                  >
                    <p className="text-xs font-bold text-gray-700 mb-1.5">
                      {set.phase}
                    </p>
                    <div className="space-y-1 mb-2">
                      {setBooks.map((b) => (
                        <p key={b.id} className="text-sm text-gray-800">
                          ▶ {b.title}
                          <span className="text-xs text-gray-500 ml-1">
                            （{b.publisher}）
                          </span>
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      💡 {set.note}
                    </p>
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
                <BookCard key={b.id} book={b} />
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
                <BookCard key={b.id} book={b} />
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
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── スケジュール根拠タブ ── */}
        <TabsContent value="method" className="space-y-4 mt-4">
          {/* スケジュール概要 */}
          <Card className="bg-gradient-to-br from-gray-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">このアプリのスケジュール設計について</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>
                学習スケジュールは以下の資格スクール・専門サイトの公開資料をもとに設計しています。
                特定の1つの方法論ではなく、複数ソースの共通知見を統合したものです。
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">43%</p>
                  <p className="text-xs text-gray-500 mt-0.5">Phase 1<br />基礎インプット</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">35%</p>
                  <p className="text-xs text-gray-500 mt-0.5">Phase 2<br />問題演習</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-orange-600">22%</p>
                  <p className="text-xs text-gray-500 mt-0.5">Phase 3<br />総仕上げ</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                ※ 必要学習時間：初学者独学は 300〜500時間が目安（各スクール共通の見解）
              </p>
            </CardContent>
          </Card>

          {/* 参照ソース一覧 */}
          <div className="space-y-3">
            {SCHEDULE_METHODS.map((method) => (
              <Card key={method.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="outline" className="mb-1.5 text-xs">
                        {method.source}
                      </Badge>
                      <CardTitle className="text-sm leading-snug">
                        {method.title}
                      </CardTitle>
                    </div>
                    {method.sourceUrl && (
                      <a
                        href={method.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 flex-shrink-0 mt-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {method.description}
                  </p>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1.5">
                      参照したポイント
                    </p>
                    <ul className="space-y-1">
                      {method.keyPoints.map((kp) => (
                        <li
                          key={kp}
                          className="flex items-start gap-1.5 text-xs text-gray-700"
                        >
                          <span className="text-blue-400 flex-shrink-0 mt-0.5">▶</span>
                          {kp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <p className="text-xs text-yellow-800 leading-relaxed">
                <strong>免責事項：</strong>
                本アプリのスケジュールはあくまで参考値です。個人差・現在の知識レベル・生活スタイルによって
                最適な計画は異なります。試験直前は公式の試験範囲を必ず確認してください。
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
