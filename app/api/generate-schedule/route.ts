import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  EXAM_DATE,
  SUBJECTS,
  STUDY_PHASES,
} from "@/lib/takken-curriculum";
import type { DailySchedule, GeneratedSchedule, StudyPhase, UserSettings } from "@/types";
import { differenceInDays, addDays, format, parseISO, isAfter } from "date-fns";

const client = new Anthropic();

function generateSchedule(settings: UserSettings): GeneratedSchedule {
  const start = parseISO(settings.startDate);
  const exam = parseISO(settings.examDate);
  const totalDays = differenceInDays(exam, start);
  const totalMinutes = totalDays * (settings.dailyMinutes * (settings.studyDays.length / 7));

  // フェーズごとの日数配分
  const phaseRatios = [0.43, 0.35, 0.22]; // インプット:演習:仕上げ
  let currentDate = start;
  const phases: StudyPhase[] = [];

  STUDY_PHASES.forEach((p, i) => {
    const phaseDays = Math.floor(totalDays * phaseRatios[i]);
    const phaseEnd = i === STUDY_PHASES.length - 1
      ? addDays(exam, -1)
      : addDays(currentDate, phaseDays - 1);

    phases.push({
      id: p.id,
      name: p.name,
      startDate: format(currentDate, "yyyy-MM-dd"),
      endDate: format(phaseEnd, "yyyy-MM-dd"),
      description: p.description,
      subjects: p.subjects,
    });

    currentDate = addDays(phaseEnd, 1);
  });

  // 分野ごとの学習時間配分（問題数比）
  const totalQuestions = Object.values(SUBJECTS).reduce((s, sub) => s + sub.questions, 0);
  const dailySchedules: DailySchedule[] = [];

  let scheduleDate = start;
  let subjectIndex = 0;
  let topicIndex = 0;
  const subjectKeys = Object.keys(SUBJECTS) as Array<keyof typeof SUBJECTS>;

  while (!isAfter(scheduleDate, addDays(exam, -1))) {
    const dow = scheduleDate.getDay();
    if (settings.studyDays.includes(dow)) {
      const phase = phases.find(
        (ph) =>
          scheduleDate >= parseISO(ph.startDate) &&
          scheduleDate <= parseISO(ph.endDate)
      );

      if (phase) {
        const subKey = subjectKeys[subjectIndex % subjectKeys.length];
        const subject = SUBJECTS[subKey];
        const topics = subject.topics;

        dailySchedules.push({
          date: format(scheduleDate, "yyyy-MM-dd"),
          subject: subKey,
          topic: topics[topicIndex % topics.length],
          targetMinutes: settings.dailyMinutes,
          phaseId: phase.id,
        });

        topicIndex++;
        if (topicIndex % topics.length === 0) {
          subjectIndex++;
        }
      }
    }
    scheduleDate = addDays(scheduleDate, 1);
  }

  return {
    phases,
    dailySchedules,
    totalDays,
    totalHours: Math.round(totalMinutes / 60),
    settings,
    generatedAt: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  const { settings } = await req.json() as { settings: UserSettings };
  const schedule = generateSchedule(settings);
  return NextResponse.json(schedule);
}
