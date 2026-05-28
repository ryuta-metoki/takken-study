"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getStudyLogs, addStudyLog, getTotalMinutesBySubject, getSchedule } from "@/lib/storage";
import { SUBJECTS } from "@/lib/takken-curriculum";
import type { StudyLog, SubjectKey } from "@/types";

export default function ProgressPage() {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: "rights" as SubjectKey,
    topic: "",
    actualMinutes: 60,
    memo: "",
  });
  const [today] = useState(format(new Date(), "yyyy-MM-dd"));
  const [schedule] = useState(() => getSchedule());

  useEffect(() => {
    setLogs(getStudyLogs());
  }, []);

  function handleAdd() {
    const log: StudyLog = {
      date: today,
      subject: form.subject,
      topic: form.topic || SUBJECTS[form.subject].topics[0],
      actualMinutes: form.actualMinutes,
      memo: form.memo,
      completedAt: new Date().toISOString(),
    };
    addStudyLog(log);
    setLogs(getStudyLogs());
    setShowForm(false);
    setForm({ subject: "rights", topic: "", actualMinutes: 60, memo: "" });
  }

  const todayLogs = logs.filter((l) => l.date === today);
  const totalStudied = logs.reduce((s, l) => s + l.actualMinutes, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">進捗管理</h1>
          <p className="text-sm text-gray-500 mt-1">学習記録を残して進捗を確認しましょう</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          記録する
        </Button>
      </div>

      {/* 記録フォーム */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">今日の学習を記録</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">分野</label>
                <select
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value as SubjectKey, topic: "" }))
                  }
                >
                  {Object.values(SUBJECTS).map((s) => (
                    <option key={s.key} value={s.key}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">学習時間</label>
                <select
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
                  value={form.actualMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, actualMinutes: Number(e.target.value) }))}
                >
                  {[15, 30, 45, 60, 90, 120].map((m) => (
                    <option key={m} value={m}>{m}分</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">学習トピック</label>
              <select
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              >
                <option value="">選択してください</option>
                {SUBJECTS[form.subject].topics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">メモ（任意）</label>
              <textarea
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white resize-none"
                rows={2}
                placeholder="理解度や気づきなど..."
                value={form.memo}
                onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1" size="sm">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                記録を保存
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} size="sm">
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 今日の記録 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            今日の学習 — {format(new Date(), "M月d日(E)", { locale: ja })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayLogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              まだ記録がありません。上のボタンから記録してみましょう！
            </p>
          ) : (
            <div className="space-y-2">
              {todayLogs.map((log, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: SUBJECTS[log.subject].color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.topic}</p>
                      <p className="text-xs text-gray-500">{SUBJECTS[log.subject].name}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{log.actualMinutes}分</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分野別進捗 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">分野別学習時間</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.values(SUBJECTS).map((subject) => {
            const minutes = getTotalMinutesBySubject(subject.key);
            const hours = minutes / 60;
            const pct = Math.min((hours / subject.totalHours) * 100, 100);
            return (
              <div key={subject.key}>
                <div className="flex justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="text-gray-700">{subject.name}</span>
                    <span className="text-gray-400 text-xs">({subject.questions}問)</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {Math.floor(hours)}h {Math.floor(minutes % 60)}m / {subject.totalHours}h
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            );
          })}

          <div className="border-t pt-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">合計学習時間</span>
              <span className="font-bold text-blue-600">
                {Math.floor(totalStudied / 60)}時間{totalStudied % 60}分
              </span>
            </div>
            {schedule && (
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>目標</span>
                <span>{schedule.totalHours}時間</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 直近の記録 */}
      {logs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">学習履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {[...logs].reverse().slice(0, 30).map((log, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs w-14">
                      {format(new Date(log.date), "M/d(E)", { locale: ja })}
                    </span>
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: SUBJECTS[log.subject].color }}
                    />
                    <span className="text-gray-700">{log.topic}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{log.actualMinutes}分</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
