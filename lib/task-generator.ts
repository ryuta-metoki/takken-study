import type { Book } from "@/lib/takken-curriculum";
import type { BookTask, SubjectKey, TaskPhase } from "@/types";
import { SUBJECTS } from "@/lib/takken-curriculum";

// テキスト系参考書のタスクテンプレート
// subject → [{ phase, title, description, estimatedMinutes }]
const TEXT_TASK_TEMPLATES: Record<
  SubjectKey,
  Array<{ title: string; description: string; estimatedMinutes: number; phase: TaskPhase }>
> = {
  business_law: [
    { title: "宅建業の意味・免許制度を読む", description: "宅建業の定義・免許の種類・申請手続きを把握する", estimatedMinutes: 60, phase: 1 },
    { title: "宅建士（登録・証明書）を読む", description: "試験・登録・証明書交付・登録の移転を理解する", estimatedMinutes: 60, phase: 1 },
    { title: "営業保証金・弁済業務保証金を読む", description: "金額・供託・取戻し・還付を数字ごと覚える", estimatedMinutes: 60, phase: 1 },
    { title: "媒介契約・重要事項説明を読む", description: "契約の種類・報告義務・説明義務者・説明タイミングを整理する", estimatedMinutes: 60, phase: 1 },
    { title: "37条書面・手付金等保全を読む", description: "記載必要事項・手付金保護の要件・限度額を覚える", estimatedMinutes: 60, phase: 1 },
    { title: "報酬規定・広告規制を読む", description: "売買と賃貸の報酬計算式を確実に習得する", estimatedMinutes: 60, phase: 1 },
    { title: "監督・罰則を読む", description: "指示処分・業務停止・免許取消しの区分けを覚える", estimatedMinutes: 45, phase: 1 },
  ],
  rights: [
    { title: "民法基礎（意思表示）を読む", description: "心裡留保・虚偽表示・錯誤・詐欺・強迫の要件と効果", estimatedMinutes: 75, phase: 1 },
    { title: "物権（所有権・担保物権）を読む", description: "物権変動・対抗要件・抵当権の効力を整理する", estimatedMinutes: 75, phase: 1 },
    { title: "債権（契約・不法行為）を読む", description: "債務不履行・解除・損害賠償の要件を把握する", estimatedMinutes: 75, phase: 1 },
    { title: "相続・遺言を読む", description: "法定相続分・遺留分・遺言の方式を覚える", estimatedMinutes: 60, phase: 1 },
    { title: "借地借家法を読む", description: "借地・借家の存続期間・更新・解約の特則を理解する", estimatedMinutes: 75, phase: 1 },
    { title: "不動産登記法を読む", description: "対抗要件・登記の効力・登記できる権利を把握する", estimatedMinutes: 60, phase: 1 },
    { title: "区分所有法を読む", description: "管理組合・集会・規約・復旧と建替えの数字を覚える", estimatedMinutes: 60, phase: 1 },
  ],
  regulations: [
    { title: "都市計画法（区域・地域地区）を読む", description: "都市計画区域・用途地域の種類と規制内容を整理する", estimatedMinutes: 60, phase: 1 },
    { title: "都市計画法（開発行為）を読む", description: "許可不要の規模・主体・用途を覚える（数字が重要）", estimatedMinutes: 60, phase: 1 },
    { title: "建築基準法（単体規定）を読む", description: "採光・換気・界壁・防火区画の基準を把握する", estimatedMinutes: 60, phase: 1 },
    { title: "建築基準法（集団規定）を読む", description: "用途制限・容積率・建蔽率・道路斜線制限を整理する", estimatedMinutes: 75, phase: 1 },
    { title: "国土利用計画法を読む", description: "届出制・許可制の面積要件・手続きを覚える", estimatedMinutes: 45, phase: 1 },
    { title: "農地法（3条・4条・5条）を読む", description: "各条文の許可権者・例外・目的を整理する", estimatedMinutes: 60, phase: 1 },
    { title: "土地区画整理法・その他を読む", description: "換地・保留地・仮換地の概念と手続きを理解する", estimatedMinutes: 45, phase: 1 },
  ],
  tax_other: [
    { title: "不動産取得税・固定資産税を読む", description: "課税主体・税率・軽減措置・免税点を覚える", estimatedMinutes: 60, phase: 1 },
    { title: "所得税（譲渡所得）を読む", description: "短期・長期の税率・3000万円特別控除を覚える", estimatedMinutes: 60, phase: 1 },
    { title: "印紙税・登録免許税を読む", description: "課税文書・税率・非課税文書を覚える", estimatedMinutes: 45, phase: 1 },
    { title: "不動産の価格（地価公示・鑑定評価）を読む", description: "地価公示の手続き・鑑定評価の3方式を把握する", estimatedMinutes: 45, phase: 1 },
  ],
  exemption: [
    { title: "住宅金融支援機構法を読む", description: "機構の業務・証券化支援事業・フラット35を理解する", estimatedMinutes: 45, phase: 1 },
    { title: "景品表示法を読む", description: "禁止される表示・必要な表示・違反時の措置を覚える", estimatedMinutes: 45, phase: 1 },
    { title: "土地（地形・地盤）を読む", description: "造成地・低地・台地・傾斜地の特性と注意点を把握する", estimatedMinutes: 30, phase: 1 },
    { title: "建物（構造・材料）を読む", description: "木造・鉄骨造・RC造・免震構造の特徴を把握する", estimatedMinutes: 30, phase: 1 },
  ],
};

// 問題集系のタスクテンプレート
const WORKBOOK_TASK_TEMPLATES: Record<
  SubjectKey,
  Array<{ title: string; description: string; estimatedMinutes: number; phase: TaskPhase }>
> = {
  business_law: [
    { title: "宅建業法の問題集を解く（免許・宅建士）", description: "宅建業の免許制度・宅建士の登録関連の問題を解く", estimatedMinutes: 60, phase: 2 },
    { title: "宅建業法の問題集を解く（保証金・媒介）", description: "営業保証金・媒介契約・重要事項説明の問題を解く", estimatedMinutes: 60, phase: 2 },
    { title: "宅建業法の問題集を解く（37条・報酬・罰則）", description: "37条書面・手付金・報酬規定・監督罰則の問題を解く", estimatedMinutes: 60, phase: 2 },
    { title: "宅建業法の弱点補強（2周目）", description: "1周目で間違えた問題を中心に再度解く", estimatedMinutes: 60, phase: 2 },
  ],
  rights: [
    { title: "権利関係の問題集を解く（民法基礎・物権）", description: "意思表示・物権変動・担保物権の問題を解く", estimatedMinutes: 75, phase: 2 },
    { title: "権利関係の問題集を解く（債権・相続）", description: "契約・不法行為・相続の問題を解く", estimatedMinutes: 75, phase: 2 },
    { title: "権利関係の問題集を解く（借地借家・登記・区分所有）", description: "特別法3科目の問題を集中的に解く", estimatedMinutes: 75, phase: 2 },
  ],
  regulations: [
    { title: "法令制限の問題集を解く（都市計画法）", description: "区域区分・用途地域・開発許可の問題を解く", estimatedMinutes: 60, phase: 2 },
    { title: "法令制限の問題集を解く（建築基準法）", description: "単体規定・集団規定の問題を解く", estimatedMinutes: 60, phase: 2 },
    { title: "法令制限の問題集を解く（農地法・国土法など）", description: "農地法・国土利用計画法・区画整理法の問題を解く", estimatedMinutes: 45, phase: 2 },
  ],
  tax_other: [
    { title: "税・価格評定の問題集を解く", description: "不動産取得税・所得税・印紙税・地価公示の問題を解く", estimatedMinutes: 60, phase: 2 },
  ],
  exemption: [
    { title: "5問免除科目の問題集を解く", description: "機構法・景表法・土地・建物の問題を解く", estimatedMinutes: 45, phase: 2 },
  ],
};

// 模試タスク（3回分）
const MOCK_TASKS = [
  { title: "第1回予想模試を解く（50問・120分）", description: "本番と同じ環境で解く。時間配分を意識すること", estimatedMinutes: 120, phase: 3 as TaskPhase },
  { title: "第1回模試の復習をする", description: "間違えた問題を全てテキストで確認する", estimatedMinutes: 90, phase: 3 as TaskPhase },
  { title: "第2回予想模試を解く（50問・120分）", description: "前回の反省を活かして時間配分を改善する", estimatedMinutes: 120, phase: 3 as TaskPhase },
  { title: "第2回模試の復習をする", description: "弱点分野に集中して復習する", estimatedMinutes: 90, phase: 3 as TaskPhase },
  { title: "第3回予想模試を解く（50問・120分）", description: "試験本番のシミュレーション。合格ラインを目指す", estimatedMinutes: 120, phase: 3 as TaskPhase },
  { title: "第3回模試の総復習", description: "全模試の間違い問題をまとめて最終確認する", estimatedMinutes: 60, phase: 3 as TaskPhase },
];

export function generateTasksFromBook(book: Book): BookTask[] {
  const tasks: BookTask[] = [];
  const subjectKeys = Object.keys(SUBJECTS) as SubjectKey[];

  if (book.category === "textbook") {
    let order = 0;
    // 宅建業法を最優先の順序で
    const prioritized: SubjectKey[] = ["business_law", "rights", "regulations", "tax_other", "exemption"];
    for (const subject of prioritized) {
      const templates = TEXT_TASK_TEMPLATES[subject] ?? [];
      for (const tpl of templates) {
        tasks.push({
          id: `task_${book.id}_${subject}_${order}`,
          bookId: book.id,
          bookTitle: book.title,
          bookCategory: "textbook",
          phase: tpl.phase,
          title: `【${book.title.slice(0, 12)}…】${tpl.title}`,
          description: tpl.description,
          subject,
          estimatedMinutes: tpl.estimatedMinutes,
          completed: false,
          order: order++,
        });
      }
    }
  } else if (book.category === "workbook") {
    let order = 0;
    const prioritized: SubjectKey[] = ["business_law", "rights", "regulations", "tax_other", "exemption"];
    for (const subject of prioritized) {
      const templates = WORKBOOK_TASK_TEMPLATES[subject] ?? [];
      for (const tpl of templates) {
        tasks.push({
          id: `task_${book.id}_${subject}_${order}`,
          bookId: book.id,
          bookTitle: book.title,
          bookCategory: "workbook",
          phase: tpl.phase,
          title: `【${book.title.slice(0, 12)}…】${tpl.title}`,
          description: tpl.description,
          subject,
          estimatedMinutes: tpl.estimatedMinutes,
          completed: false,
          order: order++,
        });
      }
    }
  } else if (book.category === "mock") {
    MOCK_TASKS.forEach((tpl, i) => {
      tasks.push({
        id: `task_${book.id}_mock_${i}`,
        bookId: book.id,
        bookTitle: book.title,
        bookCategory: "mock",
        phase: tpl.phase,
        title: `【${book.title.slice(0, 12)}…】${tpl.title}`,
        description: tpl.description,
        subject: "business_law", // 模試は全科目
        estimatedMinutes: tpl.estimatedMinutes,
        completed: false,
        order: i,
      });
    });
  }

  return tasks;
}
