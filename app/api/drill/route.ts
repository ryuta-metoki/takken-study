import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { SUBJECTS } from "@/lib/takken-curriculum";
import type { SubjectKey, QuizQuestion } from "@/types";

const client = new Anthropic();

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
    "id": "q_{{uuid4}}",
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
- 本試験の出題形式に準拠すること（「正しいものはどれか」「誤っているものはどれか」形式）
- 選択肢は「ア〜エ」の記号付きで
- 必ず実際の宅建試験で出題されうる内容にすること
- JSONのみ出力すること（前後に説明文を付けない）`;
}

export async function POST(req: NextRequest) {
  const {
    subject,
    topic,
    difficulty = "medium",
    count = 3,
  } = await req.json() as {
    subject: SubjectKey;
    topic: string;
    difficulty?: "easy" | "medium" | "hard";
    count?: number;
  };

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: buildPrompt(subject, topic, difficulty, Math.min(count, 5)),
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  // JSONブロックを抽出
  const jsonMatch = raw.match(/```json\n?([\s\S]*?)```/) ?? raw.match(/(\[[\s\S]*\])/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Failed to parse questions", raw }, { status: 500 });
  }

  try {
    const questions = JSON.parse(jsonMatch[1]) as QuizQuestion[];
    // IDが重複しないように一意化
    const timestamped = questions.map((q, i) => ({
      ...q,
      id: `${subject}_${Date.now()}_${i}`,
    }));
    return NextResponse.json(timestamped);
  } catch {
    return NextResponse.json({ error: "JSON parse failed", raw }, { status: 500 });
  }
}
