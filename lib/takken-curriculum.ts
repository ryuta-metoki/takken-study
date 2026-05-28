import type { Subject, SubjectKey } from "@/types";

export const EXAM_DATE = "2026-10-18";

export const SUBJECTS: Record<SubjectKey, Subject> = {
  rights: {
    key: "rights",
    name: "権利関係（民法等）",
    questions: 14,
    totalHours: 80,
    color: "#3B82F6",
    topics: [
      "民法基礎（法律行為・意思表示）",
      "物権（所有権・用益物権・担保物権）",
      "債権（契約・債務不履行・損害賠償）",
      "相続・遺言",
      "借地借家法",
      "不動産登記法",
      "区分所有法",
    ],
  },
  business_law: {
    key: "business_law",
    name: "宅建業法",
    questions: 20,
    totalHours: 60,
    color: "#10B981",
    topics: [
      "宅建業の意味・免許制度",
      "宅建士（登録・試験・証明書）",
      "営業保証金・弁済業務保証金",
      "媒介契約・重要事項説明",
      "37条書面・手付金等保全",
      "報酬・広告・その他規制",
      "監督・罰則",
    ],
  },
  regulations: {
    key: "regulations",
    name: "法令上の制限",
    questions: 8,
    totalHours: 40,
    color: "#F59E0B",
    topics: [
      "都市計画法（区域区分・地域地区）",
      "都市計画法（開発行為許可）",
      "建築基準法（単体規定）",
      "建築基準法（集団規定）",
      "国土利用計画法",
      "農地法",
      "土地区画整理法・その他法令",
    ],
  },
  tax_other: {
    key: "tax_other",
    name: "税・価格評定",
    questions: 3,
    totalHours: 20,
    color: "#8B5CF6",
    topics: [
      "不動産取得税・固定資産税",
      "所得税（譲渡所得）",
      "印紙税・登録免許税",
      "不動産の価格（地価公示・鑑定評価）",
    ],
  },
  exemption: {
    key: "exemption",
    name: "5問免除科目",
    questions: 5,
    totalHours: 20,
    color: "#EF4444",
    topics: [
      "住宅金融支援機構法",
      "不当景品類及び不当表示防止法",
      "土地（地形・地盤）",
      "建物（構造・材料）",
    ],
  },
};

export const STUDY_PHASES = [
  {
    id: 1,
    name: "基礎インプット期",
    description: "各分野のテキストを読み込み、基礎知識を習得する",
    weeks: 10,
    subjects: ["rights", "business_law", "regulations", "tax_other", "exemption"] as SubjectKey[],
  },
  {
    id: 2,
    name: "問題演習期",
    description: "過去問を中心に問題演習を行い、知識を定着させる",
    weeks: 8,
    subjects: ["rights", "business_law", "regulations", "tax_other", "exemption"] as SubjectKey[],
  },
  {
    id: 3,
    name: "総仕上げ期",
    description: "模試・弱点補強に集中し、本番に備える",
    weeks: 5,
    subjects: ["rights", "business_law", "regulations", "tax_other", "exemption"] as SubjectKey[],
  },
];

export const PASSING_SCORE = 35;
export const TOTAL_QUESTIONS = 50;
