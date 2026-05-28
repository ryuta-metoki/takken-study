"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { getSchedule, saveSchedule } from "@/lib/storage";
import { EXAM_DATE, SUBJECTS } from "@/lib/takken-curriculum";
import type { GeneratedSchedule, StudyPhase, UserSettings } from "@/types";

const PHASE_COLORS = ["bg-blue-100 text-blue-800", "bg-green-100 text-green-800", "bg-orange-100 text-orange-800"];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1);
  const [settings, setSettings] = useState<UserSettings>({
    examDate: EXAM_DATE,
    dailyMinutes: 60,
    studyDays: [1, 2, 3, 4, 5, 6],
    startDate: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    const saved = getSchedule();
    if (saved) setSchedule(saved);
  }, []);

  async function generateSchedule() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json() as GeneratedSchedule;
      saveSchedule(data);
      setSchedule(data);
    } finally {
      setLoading(false);
    }
  }

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">学習計画</h1>
        <p className="text-sm text-gray-500 mt-1">
          試験日から逆算した学習スケジュールを生成します
        </p>
      </div>

      {/* 設定カード */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">学習条件の設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                1日の学習時間
              </label>
              <select
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                value={settings.dailyMinutes}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, dailyMinutes: Number(e.target.value) }))
                }
              >
                <option value={30}>30分</option>
                <option value={45}>45分</option>
                <option value={60}>1時間</option>
                <option value={90}>1時間30分</option>
                <option value={120}>2時間</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                週の学習日数
              </label>
              <select
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                value={settings.studyDays.length}
                onChange={(e) => {
                  const days = Number(e.target.value);
                  const studyDays = days === 7
                    ? [0, 1, 2, 3, 4, 5, 6]
                    : [1, 2, 3, 4, 5, 6].slice(0, days);
                  setSettings((s) => ({ ...s, studyDays }));
                }}
              >
                <option value={5}>週5日（平日）</option>
                <option value={6}>週6日</option>
                <option value={7}>週7日（毎日）</option>
              </select>
            </div>
          </div>

          <Button onClick={generateSchedule} disabled={loading} className="w-full">
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />生成中...</>
            ) : schedule ? (
              <><RefreshCw className="w-4 h-4 mr-2" />計画を再生成する</>
            ) : (
              "学習計画を生成する"
            )}
          </Button>
        </CardContent>
      </Card>

      {schedule && (
        <>
          {/* サマリー */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{schedule.totalDays}</div>
                <div className="text-xs text-gray-500 mt-1">学習可能日数</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{schedule.totalHours}</div>
                <div className="text-xs text-gray-500 mt-1">総学習時間（時間）</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{schedule.phases.length}</div>
                <div className="text-xs text-gray-500 mt-1">学習フェーズ</div>
              </CardContent>
            </Card>
          </div>

          {/* フェーズ詳細 */}
          <div className="space-y-3">
            {schedule.phases.map((phase, idx) => {
              const phaseLogs = schedule.dailySchedules.filter((d) => d.phaseId === phase.id);
              const isExpanded = expandedPhase === phase.id;
              const isPast = today > phase.endDate;
              const isCurrent = today >= phase.startDate && today <= phase.endDate;

              return (
                <Card key={phase.id} className={isCurrent ? "ring-2 ring-blue-500" : ""}>
                  <CardHeader
                    className="cursor-pointer pb-3"
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={PHASE_COLORS[idx]}>Phase {phase.id}</Badge>
                        {isCurrent && <Badge className="bg-blue-600 text-white">進行中</Badge>}
                        {isPast && <Badge variant="outline" className="text-gray-400">完了</Badge>}
                        <CardTitle className="text-sm">{phase.name}</CardTitle>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                    <p className="text-xs text-gray-500 ml-0">
                      {format(parseISO(phase.startDate), "M月d日", { locale: ja })} 〜{" "}
                      {format(parseISO(phase.endDate), "M月d日", { locale: ja })}
                      （{phaseLogs.length}日間）
                    </p>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <Separator className="mb-3" />
                      <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {phaseLogs.slice(0, 30).map((d, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between text-sm py-1.5 px-2 rounded ${
                              d.date === today ? "bg-blue-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: SUBJECTS[d.subject].color }}
                              />
                              <span className="text-gray-500 text-xs w-14">
                                {format(parseISO(d.date), "M/d(E)", { locale: ja })}
                              </span>
                              <span className="text-gray-700">{d.topic}</span>
                            </div>
                            <span className="text-gray-400 text-xs">{d.targetMinutes}分</span>
                          </div>
                        ))}
                        {phaseLogs.length > 30 && (
                          <p className="text-xs text-gray-400 text-center py-2">
                            他 {phaseLogs.length - 30} 日分...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
