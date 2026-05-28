import { NextRequest, NextResponse } from "next/server";
import { SUBJECTS } from "@/lib/takken-curriculum";
import type { SubjectKey, QuizQuestion } from "@/types";

function buildPrompt(subject: SubjectKey, topic: string, difficulty: string, count: number): string {
  const subjectName = SUBJECTS[subject].name;
  return `あなたは宅地建物取引士（宅建）試験の問題作成の専門家です。

以下の条件で宅建試験の4択問題を${count}問作成してください。

- 分野：${subjectName}
- トピック：${topic}
- 難易度：${difficulty === "easy" ? "易（基本知識）" : difficulty === "medium" ? "中（標準問題）" : "難（応用・判例）"}

# 出力形式（必ずJSONのみ、説明文なし）

\`\`\`json
[
  {
    "id": "q_placeholder",
    "subject": "${subject}",
    "topic": "${topic}",
    "question": "問題文（100字前後）",
    "options": ["ア 〜", "イ 〜", "ウ 〜", "エ 〜"],
    "correctIndex": 0,
    "explanation": "解説（150字前後）。正解の根拠と誤りの理由を含める。試験に出やすいポイントも添える。",
    "difficulty": "${difficulty}"
  }
]
\`\`\`

# 注意事項
- 本試験の出題形式に準拠すること
- 選択肢は「ア〜エ」の記号付きで
- JSONのみ出力すること（前後に説明文を付けない）`;
}

async function generateWithAI(
  subject: SubjectKey,
  topic: string,
  difficulty: string,
  count: number
): Promise<QuizQuestion[]> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: buildPrompt(subject, topic, difficulty, count) }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = raw.match(/```json\n?([\s\S]*?)```/) ?? raw.match(/(\[[\s\S]*\])/);
  if (!jsonMatch) throw new Error("JSON parse failed");

  const questions = JSON.parse(jsonMatch[1]) as QuizQuestion[];
  return questions.map((q, i) => ({
    ...q,
    id: `ai_${subject}_${Date.now()}_${i}`,
  }));
}

function getFallbackQuestions(
  subject: SubjectKey,
  topic: string,
  difficulty: string,
  count: number
): QuizQuestion[] {
  // 動的importでバンクを取得（question-bankが存在しない場合も安全）
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getRandomQuestions } = require("@/lib/question-bank");
    const questions = getRandomQuestions(subject, topic, count, difficulty || undefined) as QuizQuestion[];
    if (questions.length > 0) return questions;
  } catch {
    // バンクが存在しない場合は下のデフォルトへ
  }

  // バンクもなければ最小フォールバック
  return generateMinimalFallback(subject, topic, count);
}

function generateMinimalFallback(subject: SubjectKey, topic: string, count: number): QuizQuestion[] {
  const base: QuizQuestion = {
    id: `fallback_${subject}_0`,
    subject,
    topic,
    question: `【${SUBJECTS[subject].name}】${topic}に関して、次のうち正しいものはどれか。`,
    options: [
      "ア この設問はAPIキーを設定すると、AIが自動生成した本格問題で練習できます",
      "イ APIキーは .env.local に ANTHROPIC_API_KEY=sk-ant-xxx の形式で設定します",
      "ウ Vercelにデプロイした場合はダッシュボードの環境変数に設定してください",
      "エ 設定後はVercelの再デプロイが必要です（自動でトリガーされます）",
    ],
    correctIndex: 0,
    explanation: `APIキーを設定するとこのトピック（${topic}）の本格的な宅建問題をAIが自動生成します。現在はAPIキー未設定のため、このデモ問題が表示されています。`,
    difficulty: "easy",
  };

  return Array.from({ length: Math.min(count, 3) }, (_, i) => ({
    ...base,
    id: `fallback_${subject}_${i}`,
    options: base.options,
  }));
}

export async function POST(req: NextRequest) {
  const {
    subject,
    topic,
    difficulty = "medium",
    count = 5,
  } = await req.json() as {
    subject: SubjectKey;
    topic: string;
    difficulty?: "easy" | "medium" | "hard";
    count?: number;
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // APIキーがある場合はAI生成を試みる
  if (apiKey && apiKey !== "your_api_key_here") {
    try {
      const questions = await generateWithAI(subject, topic, difficulty, Math.min(count, 5));
      return NextResponse.json(questions);
    } catch (err) {
      console.error("AI generation failed, falling back to bank:", err);
      // AI失敗時はフォールバック
    }
  }

  // APIキーなし or AI失敗 → 静的問題バンクから出題
  const questions = getFallbackQuestions(subject, topic, difficulty, Math.min(count, 5));
  return NextResponse.json(questions);
}
