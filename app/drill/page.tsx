"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Trophy,
  RefreshCw,
  Flame,
  Brain,
} from "lucide-react";
import { SUBJECTS } from "@/lib/takken-curriculum";
import { saveDrillRecord, saveDrillSession, getDueRecords, updateStreak } from "@/lib/storage";
import { createInitialSrs, calculateNextReview } from "@/lib/srs";
import type { QuizQuestion, SubjectKey, DrillQuality } from "@/types";
import { format } from "date-fns";

type Screen = "select" | "loading" | "quiz" | "answer" | "result";

const DIFFICULTY_LABELS = { easy: "易", medium: "中", hard: "難" };
const DIFFICULTY_COLORS = {
  easy: "bg-emerald-100 text-emerald-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

const SUBJECT_PRIORITY_NOTE: Record<SubjectKey, string> = {
  business_law: "配点40%の最重要科目！ここを完璧にすれば合格に近い",
  rights: "難しい分野。基礎を固めて捨て問を作らないのが鉄則",
  regulations: "暗記中心。都市計画法・建築基準法から攻める",
  tax_other: "出題パターンが決まってる。過去問で対策しやすい",
  exemption: "5問免除者は特に対策不要。非免除者は基礎だけ押さえる",
};

export default function DrillPage() {
  const [screen, setScreen] = useState<Screen>("select");
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>("business_law");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [sessionResults, setSessionResults] = useState<boolean[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    setDueCount(getDueRecords(today).length);
    setSelectedTopic(SUBJECTS["business_law"].topics[0]);
  }, []);

  const currentQuestion = questions[currentIdx];
  const isAnswered = selectedOption !== null;
  const isCorrect = isAnswered && selectedOption === currentQuestion?.correctIndex;

  async function fetchQuestions() {
    setScreen("loading");
    try {
      const res = await fetch("/api/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject,
          topic: selectedTopic,
          difficulty,
          count: 5,
        }),
      });
      const data = await res.json() as QuizQuestion[];
      if (!Array.isArray(data) || data.length === 0) throw new Error("No questions");
      setQuestions(data);
      setCurrentIdx(0);
      setSelectedOption(null);
      setSessionResults([]);
      setStartTime(Date.now());
      setScreen("quiz");
    } catch {
      // エラー時も静的問題で続行（アラートは出さない）
      setScreen("select");
    }
  }

  function handleAnswer(optionIdx: number) {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setScreen("answer");
  }

  function handleNext() {
    if (!currentQuestion) return;

    const correct = selectedOption === currentQuestion.correctIndex;
    const quality: DrillQuality = correct
      ? difficulty === "easy" ? 5 : difficulty === "medium" ? 4 : 3
      : 0;

    const srs = createInitialSrs(quality);
    const record = {
      questionId: currentQuestion.id,
      subject: currentQuestion.subject,
      topic: currentQuestion.topic,
      question: currentQuestion.question,
      correct,
      quality,
      answeredAt: new Date().toISOString(),
      ...srs,
    };
    saveDrillRecord(record);
    updateStreak();

    setSessionResults((prev) => [...prev, correct]);

    if (currentIdx + 1 >= questions.length) {
      const newResults = [...sessionResults, correct];
      saveDrillSession({
        date: format(new Date(), "yyyy-MM-dd"),
        subject: selectedSubject,
        total: newResults.length,
        correct: newResults.filter(Boolean).length,
        durationSeconds: Math.floor((Date.now() - startTime) / 1000),
        completedAt: new Date().toISOString(),
      });
      setSessionResults(newResults);
      setScreen("result");
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setScreen("quiz");
    }
  }

  // ── 分野選択画面 ──────────────────────────────────────────────
  if (screen === "select") {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">一問一答ドリル</h1>
          <p className="text-sm text-gray-500 mt-1">
            AIが問題を動的生成。解いて→記録して→復習で確実に定着させる
          </p>
        </div>

        {dueCount > 0 && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-bold text-orange-900">
                    今日復習すべき問題が {dueCount} 問あります
                  </p>
                  <p className="text-xs text-orange-700">
                    忘却曲線に基づく自動スケジュール
                  </p>
                </div>
              </div>
              <Badge className="bg-orange-500 text-white">{dueCount}問</Badge>
            </CardContent>
          </Card>
        )}

        {/* 分野選択 */}
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">分野を選ぶ</label>
          <div className="space-y-2">
            {(Object.values(SUBJECTS) as typeof SUBJECTS[SubjectKey][]).map((subj) => (
              <button
                key={subj.key}
                onClick={() => {
                  setSelectedSubject(subj.key);
                  setSelectedTopic(subj.topics[0]);
                }}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  selectedSubject === subj.key
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: subj.color }}
                    />
                    <span className="font-medium text-sm text-gray-900">{subj.name}</span>
                    <Badge variant="outline" className="text-xs">{subj.questions}問</Badge>
                    {subj.key === "business_law" && (
                      <Badge className="bg-red-100 text-red-700 text-xs">最優先</Badge>
                    )}
                  </div>
                </div>
                {selectedSubject === subj.key && (
                  <p className="text-xs text-blue-700 mt-1 ml-5">
                    💡 {SUBJECT_PRIORITY_NOTE[subj.key]}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* トピック選択 */}
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">トピックを選ぶ</label>
          <select
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            {SUBJECTS[selectedSubject].topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* 難易度 */}
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">難易度</label>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  difficulty === d
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={fetchQuestions} className="w-full h-12 text-base">
          ドリルを始める（5問）
        </Button>
      </div>
    );
  }

  // ── ローディング画面 ──────────────────────────────────────────
  if (screen === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-gray-600">AIが問題を生成中...</p>
        <p className="text-xs text-gray-400">{selectedTopic}</p>
      </div>
    );
  }

  // ── 問題画面 & 回答画面 ───────────────────────────────────────
  if ((screen === "quiz" || screen === "answer") && currentQuestion) {
    return (
      <div className="space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={DIFFICULTY_COLORS[currentQuestion.difficulty]}>
              {DIFFICULTY_LABELS[currentQuestion.difficulty]}
            </Badge>
            <span className="text-sm text-gray-500">{currentQuestion.topic}</span>
          </div>
          <span className="text-sm text-gray-500">
            {currentIdx + 1} / {questions.length}
          </span>
        </div>
        <Progress value={((currentIdx) / questions.length) * 100} className="h-1.5" />

        {/* 問題 */}
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </p>
          </CardContent>
        </Card>

        {/* 選択肢 */}
        <div className="space-y-2">
          {currentQuestion.options.map((opt, idx) => {
            let cls = "w-full text-left p-3 rounded-xl border-2 text-sm transition-all ";
            if (!isAnswered) {
              cls += "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50";
            } else if (idx === currentQuestion.correctIndex) {
              cls += "border-green-500 bg-green-50 text-green-900";
            } else if (idx === selectedOption) {
              cls += "border-red-400 bg-red-50 text-red-900";
            } else {
              cls += "border-gray-100 bg-gray-50 text-gray-400";
            }

            return (
              <button key={idx} className={cls} onClick={() => handleAnswer(idx)}>
                <div className="flex items-start gap-2">
                  {isAnswered && idx === currentQuestion.correctIndex && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && (
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  {(!isAnswered || (idx !== currentQuestion.correctIndex && idx !== selectedOption)) && (
                    <div className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 解説 */}
        {isAnswered && (
          <Card className={isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-bold text-sm ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                  {isCorrect ? "正解！" : "不正解..."}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </CardContent>
          </Card>
        )}

        {isAnswered && (
          <Button onClick={handleNext} className="w-full">
            {currentIdx + 1 >= questions.length ? "結果を見る" : "次の問題"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    );
  }

  // ── 結果画面 ─────────────────────────────────────────────────
  if (screen === "result") {
    const correct = sessionResults.filter(Boolean).length;
    const total = sessionResults.length;
    const pct = Math.round((correct / total) * 100);

    return (
      <div className="space-y-5">
        <div className="text-center py-6">
          {pct >= 80 ? (
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
          ) : pct >= 60 ? (
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
          ) : (
            <Brain className="w-16 h-16 text-blue-500 mx-auto mb-3" />
          )}
          <h2 className="text-2xl font-bold text-gray-900">
            {correct} / {total} 問正解
          </h2>
          <p className="text-4xl font-bold text-blue-600 mt-1">{pct}%</p>
          <p className="text-sm text-gray-500 mt-2">
            {pct >= 80
              ? "素晴らしい！この調子で続けよう"
              : pct >= 60
              ? "あと少し！間違えた問題を復習しよう"
              : "焦らずに。間違えた問題が復習で出てくるよ"}
          </p>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-blue-800">
                間違えた問題は自動的に復習スケジュールに登録されました。
                明日または数日後に「今日の復習」として出題されます。
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {sessionResults.map((r, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${
                r ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {r ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 flex-shrink-0" />
              )}
              問題 {i + 1}：{r ? "正解" : "不正解"}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={() => { setScreen("select"); setQuestions([]); }} variant="outline" className="flex-1">
            分野を変える
          </Button>
          <Button onClick={fetchQuestions} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-1" />
            同じ設定でもう一度
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
