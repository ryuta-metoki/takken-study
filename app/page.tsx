"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Brain,
  AlertCircle,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { differenceInDays, format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import {
  getSchedule,
  getStudyLogs,
  getTotalMinutesBySubject,
  getStreakData,
  getSubjectAccuracies,
  getTodayDueCount,
  getTotalDrillStats,
} from "@/lib/storage";
import { SUBJECTS, EXAM_DATE } from "@/lib/takken-curriculum";
import { estimateScore } from "@/lib/srs";
import type { GeneratedSchedule, StudyLog, StreakData, SubjectAccuracy } from "@/types";

const PASSING_SCORE = 36;

export default function Dashboard() {
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0, longestStreak: 0, lastStudyDate: "", totalStudyDays: 0,
  });
  const [accuracies, setAccuracies] = useState<SubjectAccuracy[]>([]);
  const [drillStats, setDrillStats] = useState({ total: 0, correct: 0, accuracy: 0 });
  const [dueCount, setDueCount] = useState(0);
  const [today] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    setSchedule(getSchedule());
    setLogs(getStudyLogs());
    setStreak(getStreakData());
    setAccuracies(getSubjectAccuracies());
    setDrillStats(getTotalDrillStats());
    setDueCount(getTodayDueCount());
  }, []);

  const daysLeft = differenceInDays(parseISO(EXAM_DATE), new Date());
  const todaySchedule = schedule?.dailySchedules.find((d) => d.date === today);
  const todayLogs = logs.filter((l) => l.date === today);
  const todayStudiedMinutes = todayLogs.reduce((s, l) => s + l.actualMinutes, 0);
  const currentPhase = schedule?.phases.find(
    (p) => today >= p.startDate && today <= p.endDate
  );

  const accuracyMap = Object.fromEntries(accuracies.map((a) => [a.subject, a.accuracy]));
  const estimatedScore = estimateScore(accuracyMap);
  const canPass = estimatedScore >= PASSING_SCORE;

  // 弱点（正答率 60% 未満で問題を解いたことがある分野）
  const weakSubjects = accuracies.filter((a) => a.total > 0 && a.accuracy < 60);

  // 合格まで必要なスコア
  const scoreGap = Math.max(0, PASSING_SCORE - estimatedScore);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">
          {format(new Date(), "yyyy年M月d日(E)", { locale: ja })}
        </p>
      </div>

      {/* ストリーク＋試験まで */}
      <div className="grid grid-cols-2 gap-3">
        <Card className={`${streak.currentStreak >= 7 ? "bg-gradient-to-br from-orange-500 to-red-500" : streak.currentStreak >= 3 ? "bg-gradient-to-br from-orange-400 to-amber-500" : "bg-gradient-to-br from-gray-600 to-gray-700"} text-white border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 opacity-90" />
              <span className="text-xs opacity-80">連続学習</span>
            </div>
            <div className="text-3xl font-bold">{streak.currentStreak}</div>
            <div className="text-xs opacity-80">日連続 🔥</div>
            <div className="text-xs opacity-60 mt-1">最長 {streak.longestStreak}日</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 opacity-80" />
              <span className="text-xs opacity-80">試験まで</span>
            </div>
            <div className="text-3xl font-bold">{daysLeft}</div>
            <div className="text-xs opacity-80">日</div>
            <div className="text-xs opacity-60 mt-1">2026年10月18日</div>
          </CardContent>
        </Card>
      </div>

      {/* 予測スコア */}
      {drillStats.total > 0 && (
        <Card className={canPass ? "border-green-300 bg-green-50" : "border-orange-300 bg-orange-50"}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className={`w-5 h-5 ${canPass ? "text-green-600" : "text-orange-600"}`} />
                <span className="text-sm font-bold text-gray-800">現在の実力推定スコア</span>
              </div>
              <span className={`text-2xl font-bold ${canPass ? "text-green-700" : "text-orange-700"}`}>
                {estimatedScore} / 50点
              </span>
            </div>
            <Progress
              value={(estimatedScore / 50) * 100}
              className="h-3 mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>合格ライン：{PASSING_SCORE}点</span>
              {canPass ? (
                <span className="text-green-700 font-medium">合格圏内！</span>
              ) : (
                <span className="text-orange-700 font-medium">あと {scoreGap} 点</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ※ 解いた問題の正答率から算出。問題数が増えるほど精度が上がります
            </p>
          </CardContent>
        </Card>
      )}

      {/* 今日のタスク */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            今日やること
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* 復習 */}
          <Link
            href="/drill"
            className={`flex items-center justify-between p-3 rounded-xl ${
              dueCount > 0 ? "bg-orange-50 border border-orange-200" : "bg-gray-50 border border-gray-200"
            } hover:opacity-80 transition-opacity`}
          >
            <div className="flex items-center gap-2">
              <Brain className={`w-5 h-5 ${dueCount > 0 ? "text-orange-500" : "text-gray-400"}`} />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {dueCount > 0 ? `復習問題 ${dueCount}問（要対応）` : "今日の復習は完了！"}
                </p>
                <p className="text-xs text-gray-500">忘却曲線スケジュール</p>
              </div>
            </div>
            {dueCount > 0 && <Badge className="bg-orange-500 text-white">{dueCount}</Badge>}
          </Link>

          {/* 今日のスケジュール */}
          {todaySchedule ? (
            <Link
              href="/progress"
              className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: SUBJECTS[todaySchedule.subject].color }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{todaySchedule.topic}</p>
                  <p className="text-xs text-gray-500">
                    {SUBJECTS[todaySchedule.subject].name}・{todaySchedule.targetMinutes}分
                  </p>
                </div>
              </div>
              {todayStudiedMinutes >= todaySchedule.targetMinutes ? (
                <Badge className="bg-green-500 text-white">完了</Badge>
              ) : (
                <Badge variant="outline">{todayStudiedMinutes}/{todaySchedule.targetMinutes}分</Badge>
              )}
            </Link>
          ) : !schedule ? (
            <Link
              href="/schedule"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-dashed border-gray-300 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <p className="text-sm text-gray-600">学習計画を生成しよう</p>
              </div>
            </Link>
          ) : null}

          {/* ドリルで新しい問題 */}
          <Link
            href="/drill"
            className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-200 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">ドリルで問題を解く</p>
                <p className="text-xs text-gray-500">AIが問題を生成・宅建業法から始めよう</p>
              </div>
            </div>
            <span className="text-xs text-purple-600 font-medium">5問</span>
          </Link>
        </CardContent>
      </Card>

      {/* 弱点アラート */}
      {weakSubjects.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              弱点分野アラート（正答率60%未満）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weakSubjects.map((w) => (
              <div key={w.subject} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: SUBJECTS[w.subject].color }}
                  />
                  <span className="text-sm text-gray-800">{SUBJECTS[w.subject].name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-red-700">{w.accuracy}%</span>
                  {w.trend === "up" ? (
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  ) : w.trend === "down" ? (
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
            <Link
              href="/drill"
              className={buttonVariants({ size: "sm" }) + " w-full mt-2 justify-center"}
            >
              弱点分野を集中ドリル
            </Link>
          </CardContent>
        </Card>
      )}

      {/* 分野別正答率 */}
      {drillStats.total > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">分野別正答率</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {accuracies.map((acc) => (
              <div key={acc.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: SUBJECTS[acc.subject].color }}
                    />
                    <span className="text-gray-700">{SUBJECTS[acc.subject].name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 text-xs">{acc.correct}/{acc.total}問</span>
                    <span className={`font-bold text-xs ${
                      acc.accuracy >= 80 ? "text-green-600" :
                      acc.accuracy >= 60 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {acc.accuracy}%
                    </span>
                    {acc.trend === "up" ? (
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    ) : acc.trend === "down" ? (
                      <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                    ) : null}
                  </div>
                </div>
                <Progress
                  value={acc.accuracy}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 学習時間進捗 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">学習時間の進捗</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.values(SUBJECTS).map((subject) => {
            const studied = getTotalMinutesBySubject(subject.key) / 60;
            const pct = Math.min((studied / subject.totalHours) * 100, 100);
            return (
              <div key={subject.key}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="text-gray-700">{subject.name}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {Math.floor(studied)}h / {subject.totalHours}h
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })}
          <div className="text-xs text-gray-400 pt-1">
            ドリル {drillStats.total}問解答済 ・ 累計学習{Math.floor(logs.reduce((s,l)=>s+l.actualMinutes,0)/60)}時間
          </div>
        </CardContent>
      </Card>

      {/* 学習計画が未生成なら誘導 */}
      {!schedule && (
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              学習計画がまだありません
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              逆算スケジュールを生成して、計画的に勉強を始めましょう
            </p>
            <Link href="/schedule" className={buttonVariants()}>
              学習計画を作成する
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
