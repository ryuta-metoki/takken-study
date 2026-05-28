import { NextRequest, NextResponse } from "next/server";
import { EXAM_DATE, SUBJECTS, STUDY_PHASES } from "@/lib/takken-curriculum";
import type { DailySchedule, GeneratedSchedule, StudyPhase, SubjectKey, UserSettings } from "@/types";
import { differenceInDays, addDays, format, parseISO, isAfter } from "date-fns";

// 宅建業法優先の科目ブロックシーケンス（Phase 1用）
// 配点の高い順・コスパの高い順で配置
const PHASE1_SEQUENCE: Array<{ subject: SubjectKey; topicCount: number }> = [
  { subject: "business_law", topicCount: 3 },  // 宅建業法を2周（配点40%・最重要）
  { subject: "rights", topicCount: 2 },         // 権利関係（配点28%・難しい）
  { subject: "business_law", topicCount: 2 },   // 宅建業法を再確認
  { subject: "regulations", topicCount: 2 },    // 法令上の制限（暗記中心）
  { subject: "tax_other", topicCount: 1 },      // 税その他
  { subject: "exemption", topicCount: 1 },      // 5問免除
  { subject: "rights", topicCount: 1 },         // 権利関係の苦手補強
];

// Phase 2: 問題数比でローテーション（実力確認）
const PHASE2_WEIGHTS: Record<SubjectKey, number> = {
  business_law: 4,  // 20問 → 多め
  rights: 3,        // 14問
  regulations: 2,   // 8問
  tax_other: 1,     // 3問
  exemption: 1,     // 5問
};

// Phase 3: 弱点補強＋模試対策
const PHASE3_SEQUENCE: SubjectKey[] = [
  "business_law", "rights", "business_law", "regulations",
  "tax_other", "exemption", "business_law", "rights",
];

function buildPhase1Topics(subjects: typeof SUBJECTS): Array<{ subject: SubjectKey; topic: string }> {
  const result: Array<{ subject: SubjectKey; topic: string }> = [];
  for (const { subject, topicCount } of PHASE1_SEQUENCE) {
    const topics = subjects[subject].topics;
    for (let i = 0; i < topicCount; i++) {
      for (const topic of topics.slice(
        Math.floor((i / topicCount) * topics.length),
        Math.floor(((i + 1) / topicCount) * topics.length) || topics.length
      )) {
        result.push({ subject, topic });
      }
    }
  }
  return result;
}

function buildPhase2Topics(subjects: typeof SUBJECTS): Array<{ subject: SubjectKey; topic: string }> {
  const result: Array<{ subject: SubjectKey; topic: string }> = [];
  const entries = Object.entries(PHASE2_WEIGHTS) as Array<[SubjectKey, number]>;
  for (let round = 0; round < 8; round++) {
    for (const [subject, weight] of entries) {
      for (let w = 0; w < weight; w++) {
        const topics = subjects[subject].topics;
        result.push({ subject, topic: topics[(round * weight + w) % topics.length] });
      }
    }
  }
  return result;
}

function buildPhase3Topics(subjects: typeof SUBJECTS): Array<{ subject: SubjectKey; topic: string }> {
  const result: Array<{ subject: SubjectKey; topic: string }> = [];
  for (let i = 0; i < 30; i++) {
    const subject = PHASE3_SEQUENCE[i % PHASE3_SEQUENCE.length];
    const topics = subjects[subject].topics;
    result.push({ subject, topic: topics[i % topics.length] });
  }
  return result;
}

function generateSchedule(settings: UserSettings): GeneratedSchedule {
  const start = parseISO(settings.startDate);
  const exam = parseISO(settings.examDate);
  const totalDays = differenceInDays(exam, start);
  const totalMinutes = totalDays * (settings.dailyMinutes * (settings.studyDays.length / 7));

  const phaseRatios = [0.43, 0.35, 0.22];
  let currentDate = start;
  const phases: StudyPhase[] = [];

  STUDY_PHASES.forEach((p, i) => {
    const phaseDays = Math.floor(totalDays * phaseRatios[i]);
    const phaseEnd =
      i === STUDY_PHASES.length - 1
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

  // フェーズごとのトピックシーケンスを事前生成
  const phase1Topics = buildPhase1Topics(SUBJECTS);
  const phase2Topics = buildPhase2Topics(SUBJECTS);
  const phase3Topics = buildPhase3Topics(SUBJECTS);

  const phaseTopicCounters = [0, 0, 0];
  const dailySchedules: DailySchedule[] = [];
  let scheduleDate = start;

  while (!isAfter(scheduleDate, addDays(exam, -1))) {
    const dow = scheduleDate.getDay();
    if (settings.studyDays.includes(dow)) {
      const phaseIdx = phases.findIndex(
        (ph) =>
          format(scheduleDate, "yyyy-MM-dd") >= ph.startDate &&
          format(scheduleDate, "yyyy-MM-dd") <= ph.endDate
      );

      if (phaseIdx >= 0) {
        const phase = phases[phaseIdx];
        const counter = phaseTopicCounters[phaseIdx];
        let subject: SubjectKey;
        let topic: string;

        if (phaseIdx === 0) {
          const t = phase1Topics[counter % phase1Topics.length];
          subject = t.subject;
          topic = t.topic;
        } else if (phaseIdx === 1) {
          const t = phase2Topics[counter % phase2Topics.length];
          subject = t.subject;
          topic = t.topic;
        } else {
          const t = phase3Topics[counter % phase3Topics.length];
          subject = t.subject;
          topic = t.topic;
        }

        dailySchedules.push({
          date: format(scheduleDate, "yyyy-MM-dd"),
          subject,
          topic,
          targetMinutes: settings.dailyMinutes,
          phaseId: phase.id,
        });

        phaseTopicCounters[phaseIdx]++;
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
  const { settings } = (await req.json()) as { settings: UserSettings };
  const schedule = generateSchedule(settings);
  return NextResponse.json(schedule);
}
