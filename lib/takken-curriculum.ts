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

// ─── 参考書データ ────────────────────────────────────────────────

export type BookCategory = "textbook" | "workbook" | "mock" | "onepoint";

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  category: BookCategory;
  level: "beginner" | "standard" | "advanced";
  rank: number;
  description: string;
  strengths: string[];
  subjects: SubjectKey[];
  amazonUrl?: string;
  officialUrl?: string;
  recommended: boolean;
  year: number;
}

export const BOOKS: Book[] = [
  // ── テキスト ──────────────────────────────────────────────────
  {
    id: "tac-minna",
    title: "みんなが欲しかった！宅建士の教科書",
    author: "滝澤ななみ",
    publisher: "TAC出版",
    category: "textbook",
    level: "beginner",
    rank: 1,
    description:
      "売上No.1（紀伊國屋PubLine調べ、2015〜2025年連続）。フルカラーで図解が豊富。3分冊に分けて持ち運べる。初学者が最初に手にするべき1冊。",
    strengths: [
      "フルカラー図解で視覚的に理解しやすい",
      "3分冊セパレートで持ち運び便利",
      "重要ポイントが一目でわかる",
      "同シリーズの問題集・過去問と組み合わせ最適",
    ],
    subjects: ["rights", "business_law", "regulations", "tax_other", "exemption"],
    officialUrl: "https://bookstore.tac-school.co.jp/",
    recommended: true,
    year: 2026,
  },
  {
    id: "lec-torisetu",
    title: "宅建士 合格のトリセツ 基本テキスト",
    author: "友次正浩",
    publisher: "LEC東京リーガルマインド",
    category: "textbook",
    level: "beginner",
    rank: 2,
    description:
      "「法律はじめて」でも安心の超わかりやすい解説が特徴。LEC講師の授業をそのままテキスト化したような語り口で読み進めやすい。",
    strengths: [
      "初学者向けの丁寧な解説",
      "重要度ランク付きで効率よく学べる",
      "同シリーズの過去問と相性抜群",
      "LEC公式YouTubeと連携した学習が可能",
    ],
    subjects: ["rights", "business_law", "regulations", "tax_other", "exemption"],
    officialUrl: "https://online.lec-jp.com/",
    recommended: true,
    year: 2026,
  },
  {
    id: "tac-wakatte",
    title: "わかって合格る宅建士 基本テキスト",
    author: "TAC宅建士講座",
    publisher: "TAC出版",
    category: "textbook",
    level: "standard",
    rank: 3,
    description:
      "TACの生講義スタイルを再現した「ですます調」テキスト。かみ砕いた解説で理解を重視。「みんなが欲しかった」より詳しい説明が欲しい人向け。",
    strengths: [
      "授業を聴いているような丁寧な解説",
      "根拠・理由まで解説するので記憶に残りやすい",
      "法改正情報が確実に反映",
    ],
    subjects: ["rights", "business_law", "regulations", "tax_other", "exemption"],
    officialUrl: "https://bookstore.tac-school.co.jp/",
    recommended: false,
    year: 2026,
  },
  {
    id: "lec-deru-jun",
    title: "出る順宅建士 合格テキスト",
    author: "LEC東京リーガルマインド",
    publisher: "LEC東京リーガルマインド",
    category: "textbook",
    level: "advanced",
    rank: 4,
    description:
      "全3冊・合計約1,200ページの本格派テキスト。条文まで掲載した完全版。合格後も使える辞書的な1冊。本気で高得点を狙う人向け。",
    strengths: [
      "条文・判例まで網羅した本格派",
      "宅建業法で高得点を狙える詳細解説",
      "合格後の実務でも使える",
    ],
    subjects: ["rights", "business_law", "regulations", "tax_other", "exemption"],
    officialUrl: "https://online.lec-jp.com/",
    recommended: false,
    year: 2026,
  },
  // ── 問題集・過去問 ───────────────────────────────────────────
  {
    id: "tac-minna-mondai",
    title: "みんなが欲しかった！宅建士の問題集",
    author: "滝澤ななみ",
    publisher: "TAC出版",
    category: "workbook",
    level: "beginner",
    rank: 1,
    description:
      "「みんなが欲しかった！教科書」と完全リンク。テキストの参照先が明記されているので行き来しやすい。テキストと併用するなら絶対コレ。",
    strengths: [
      "教科書との完全リンク",
      "解説が丁寧でテキストなしでも読める",
      "3分冊セパレートで持ち運び便利",
    ],
    subjects: ["rights", "business_law", "regulations", "tax_other", "exemption"],
    officialUrl: "https://bookstore.tac-school.co.jp/",
    recommended: true,
    year: 2026,
  },
  {
    id: "lec-torisetu-kakomon",
    title: "宅建士 合格のトリセツ 分野別過去問題集",
    author: "友次正浩",
    publisher: "LEC東京リーガルマインド",
    category: "workbook",
    level: "beginner",
    rank: 2,
    description:
      "分野別に整理された過去問集。LECの合格のトリセツシリーズとの連携が抜群。テキストと交互に学ぶ「並行学習法」に最適。",
    strengths: [
      "分野別整理で苦手を集中攻略",
      "解説が充実でテキスト不要",
      "合格のトリセツテキストとの連携",
    ],
    subjects: ["rights", "business_law", "regulations", "tax_other", "exemption"],
    officialUrl: "https://online.lec-jp.com/",
    recommended: false,
    year: 2026,
  },
  {
    id: "tac-kakomon-10",
    title: "みんなが欲しかった！宅建士 過去問題集（10年分）",
    author: "TAC宅建士講座",
    publisher: "TAC出版",
    category: "workbook",
    level: "standard",
    rank: 3,
    description:
      "直近10年分の本試験問題を収録。年度別と分野別の両方で解ける二刀流構成。Phase 2（問題演習期）で徹底活用。",
    strengths: [
      "10年分の本試験問題を網羅",
      "年度別・分野別の両方で解ける",
      "本番の出題形式に慣れられる",
    ],
    subjects: ["rights", "business_law", "regulations", "tax_other", "exemption"],
    officialUrl: "https://bookstore.tac-school.co.jp/",
    recommended: true,
    year: 2026,
  },
  // ── 模試 ────────────────────────────────────────────────────
  {
    id: "tac-yoso-moshi",
    title: "みんなが欲しかった！宅建士 直前予想問題集",
    author: "TAC宅建士講座",
    publisher: "TAC出版",
    category: "mock",
    level: "standard",
    rank: 1,
    description:
      "Phase 3（総仕上げ期）で必須の模試集。最新の出題傾向を踏まえたオリジナル問題3回分収録。本番前の実力確認に。",
    strengths: [
      "最新の出題傾向を反映",
      "本番形式で時間感覚を掴める",
      "詳細な解説で弱点を発見できる",
    ],
    subjects: ["rights", "business_law", "regulations", "tax_other", "exemption"],
    officialUrl: "https://bookstore.tac-school.co.jp/",
    recommended: true,
    year: 2026,
  },
  {
    id: "lec-yoso-moshi",
    title: "出る順宅建士 当たる直前予想模試",
    author: "LEC東京リーガルマインド",
    publisher: "LEC東京リーガルマインド",
    category: "mock",
    level: "standard",
    rank: 2,
    description:
      "LECの高的中率で知られる予想模試。3回分収録。LEC講師陣が分析した頻出ポイントを凝縮。",
    strengths: [
      "的中実績が高い",
      "詳細な出題ポイント解説付き",
      "出る順テキストとの連携",
    ],
    subjects: ["rights", "business_law", "regulations", "tax_other", "exemption"],
    officialUrl: "https://online.lec-jp.com/",
    recommended: false,
    year: 2026,
  },
];

// ─── スケジュール根拠データ ──────────────────────────────────────

export interface ScheduleMethod {
  id: string;
  title: string;
  source: string;
  sourceUrl?: string;
  description: string;
  keyPoints: string[];
}

export const SCHEDULE_METHODS: ScheduleMethod[] = [
  {
    id: "studying-300h",
    title: "STUDYing 宅建講座「300時間3ヵ月合格スケジュール」",
    source: "STUDYing（スタディング）",
    sourceUrl: "https://studying.jp/takken/about-more/studyschedule.html",
    description:
      "オンライン資格スクール大手STUDYingが推奨する、試験日から逆算した3フェーズ学習法。「インプット→アウトプット→直前対策」の流れが、今回のアプリのスケジュール設計の基本フレームワーク。",
    keyPoints: [
      "合格に必要な勉強時間の目安：200〜300時間（初学者は300〜500時間）",
      "1日2時間 × 5ヶ月 = 300時間で合格ライン到達が目標",
      "3フェーズ構成：インプット（45%）→演習（35%）→直前（20%）",
      "試験日を固定してそこから逆算して各フェーズの期間を決定",
    ],
  },
  {
    id: "lec-selfstudy",
    title: "LEC東京リーガルマインド「時期別独学合格法」",
    source: "LEC東京リーガルマインド",
    sourceUrl: "https://www.lec-jp.com/takken/about/selfstudy.html",
    description:
      "資格スクール最大手LECが公表している独学者向けの時期別戦略。各フェーズで何をすべきかが明確に示されており、今回のフェーズ名・内容の設計に参照。",
    keyPoints: [
      "【5〜7月：インプット期】テキストで全体像を把握し基礎知識を定着",
      "【8〜9月：アウトプット期】過去問を繰り返し解いて知識を実践で定着",
      "【10月：直前期】弱点補強・模試で本番感覚を身につける",
      "宅建業法（20問）を最優先に仕上げると点数が安定する",
    ],
  },
  {
    id: "nikken-method",
    title: "日建学院「分野別時間配分の最適化」",
    source: "日建学院",
    sourceUrl: "https://www.ksknet.co.jp/nikken/guidance/housing/contents/08/",
    description:
      "建設系資格の老舗・日建学院が公表する分野別の学習時間配分。配点の高い宅建業法を厚く、5問免除を軽くする配分設計は今回のtotalHours設定の根拠。",
    keyPoints: [
      "宅建業法（20問/40%）：最重要・学習コスパ最高",
      "権利関係（14問/28%）：民法は難しいが捨て問にしない",
      "法令上の制限（8問/16%）：暗記中心で得点しやすい",
      "税その他（8問/16%）：出題パターンが決まっており対策しやすい",
    ],
  },
  {
    id: "takken-job-reverse",
    title: "宅建Jobコラム「逆算スケジュール完全版」",
    source: "宅建Jobコラム",
    sourceUrl: "https://takken-job.com/column/takken-study-schedule/",
    description:
      "不動産業界就職支援サービス「宅建Job」が公開する学習スケジュール論文。「試験日を決めてから計算する逆算法」の具体的な手順と、週あたり学習日数の設定方法を参照。",
    keyPoints: [
      "試験日（10月第3日曜日）を絶対的な締切として固定",
      "1日の学習可能時間 × 週の学習日数 × 残り週数 = 総学習時間で検算",
      "「毎日やる」より「週5〜6日」が継続率が高く実績ベースで推奨",
      "過去問は最低3周、合格者平均は4〜5周",
    ],
  },
];
