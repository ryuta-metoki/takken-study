"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Clock, Target, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { differenceInDays, format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { getSchedule, getStudyLogs, getTotalMinutesBySubject } from "@/lib/storage";
import { SUBJECTS, EXAM_DATE } from "@/lib/takken-curriculum";
import type { GeneratedSchedule, StudyLog } from "@/types";

export default function Dashboard() {
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [today] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    setSchedule(getSchedule());
    setLogs(getStudyLogs());
  }, []);

  const daysLeft = differenceInDays(parseISO(EXAM_DATE), new Date());
  const todaySchedule = schedule?.dailySchedules.find((d) => d.date === today);
  const todayLogs = logs.filter((l) => l.date === today);
  const todayStudiedMinutes = todayLogs.reduce((s, l) => s + l.actualMinutes, 0);

  const currentPhase = schedule?.phases.find(
    (p) => today >= p.startDate && today <= p.endDate
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-1">
          {format(new Date(), "yyyy年M月d日(E)", { locale: ja })}
        </p>
      </div>

      {/* 試験まで残り日数 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="col-span-2 sm:col-span-1 bg-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 opacity-80" />
              <span className="text-xs opacity-80">試験まで</span>
            </div>
            <div className="text-3xl font-bold">{daysLeft}</div>
            <div className="text-xs opacity-80">日</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">試験日</span>
            </div>
            <div className="text-lg font-bold text-gray-900">10/18</div>
            <div className="text-xs text-gray-500">2026年</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">今日の学習</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{todayStudiedMinutes}分</div>
            <div className="text-xs text-gray-500">
              {todaySchedule ? `目標: ${todaySchedule.targetMinutes}分` : "記録なし"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">総学習時間</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {Math.floor(logs.reduce((s, l) => s + l.actualMinutes, 0) / 60)}時間
            </div>
            <div className="text-xs text-gray-500">累計</div>
          </CardContent>
        </Card>
      </div>

      {!schedule ? (
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              学習計画がまだありません
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              まず学習計画を生成して、効率的な勉強を始めましょう！
            </p>
            <Link href="/schedule" className={buttonVariants()}>
              学習計画を作成する
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 現在のフェーズ */}
          {currentPhase && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">現在のフェーズ</CardTitle>
                  <Badge variant="outline">Phase {currentPhase.id}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-semibold text-gray-900 mb-1">{currentPhase.name}</div>
                <p className="text-sm text-gray-600 mb-3">{currentPhase.description}</p>
                <div className="text-xs text-gray-500">
                  {format(parseISO(currentPhase.startDate), "M/d")} 〜{" "}
                  {format(parseISO(currentPhase.endDate), "M/d")}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 今日の学習内容 */}
          {todaySchedule && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">今日の学習内容</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: SUBJECTS[todaySchedule.subject].color }}
                    />
                    <span className="font-medium text-gray-900">
                      {SUBJECTS[todaySchedule.subject].name}
                    </span>
                    <p className="text-sm text-gray-600 mt-1 ml-5">{todaySchedule.topic}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{todaySchedule.targetMinutes}分</div>
                    {todayStudiedMinutes >= todaySchedule.targetMinutes && (
                      <Badge className="bg-green-100 text-green-800 mt-1">完了</Badge>
                    )}
                  </div>
                </div>
                {todayStudiedMinutes > 0 && (
                  <div className="mt-3">
                    <Progress
                      value={Math.min((todayStudiedMinutes / todaySchedule.targetMinutes) * 100, 100)}
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {todayStudiedMinutes} / {todaySchedule.targetMinutes}分
                    </p>
                  </div>
                )}
                <Link
                  href="/progress"
                  className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-3 w-full justify-center"}
                >
                  学習を記録する
                </Link>
              </CardContent>
            </Card>
          )}

          {/* 分野別進捗 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">分野別進捗</CardTitle>
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
