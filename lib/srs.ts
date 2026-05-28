import type { DrillQuality, DrillRecord } from "@/types";
import { addDays, format } from "date-fns";

// SM-2アルゴリズムに基づくスペースドリペティション
// 参考: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-super-memo-method

const MIN_EASE = 1.3;
const INITIAL_EASE = 2.5;

export function calculateNextReview(
  record: Pick<DrillRecord, "interval" | "easeFactor" | "repetitions">,
  quality: DrillQuality
): Pick<DrillRecord, "interval" | "easeFactor" | "repetitions" | "nextReview"> {
  let { interval, easeFactor, repetitions } = record;

  if (quality < 3) {
    // 不正解: 最初からやり直し
    interval = 1;
    repetitions = 0;
  } else {
    // 正解
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // ease factor を更新
  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  const nextReview = format(addDays(new Date(), interval), "yyyy-MM-dd");

  return { interval, easeFactor, repetitions, nextReview };
}

export function createInitialSrs(quality: DrillQuality) {
  return calculateNextReview(
    { interval: 0, easeFactor: INITIAL_EASE, repetitions: 0 },
    quality
  );
}

export function isDueForReview(record: Pick<DrillRecord, "nextReview">): boolean {
  const today = format(new Date(), "yyyy-MM-dd");
  return record.nextReview <= today;
}

// 正答率から予測スコアを算出（50点満点）
export function estimateScore(accuracyBySubject: Record<string, number>): number {
  const weights: Record<string, number> = {
    rights: 14,
    business_law: 20,
    regulations: 8,
    tax_other: 3,
    exemption: 5,
  };

  let score = 0;
  for (const [subj, questions] of Object.entries(weights)) {
    const acc = (accuracyBySubject[subj] ?? 50) / 100;
    score += acc * questions;
  }
  return Math.round(score);
}
