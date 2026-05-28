import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `あなたは宅地建物取引士（宅建）試験の専門家AIアシスタントです。
受験生の質問に対して、正確でわかりやすい解説を行ってください。

## 対応する分野
- 権利関係（民法・借地借家法・不動産登記法・区分所有法）
- 宅建業法（免許・宅建士・重要事項説明・37条書面など）
- 法令上の制限（都市計画法・建築基準法・農地法など）
- 税・価格評定（不動産取得税・固定資産税・譲渡所得税など）
- 5問免除科目（住宅金融支援機構・景品表示法・土地・建物）

## 回答スタイル
- 条文の根拠や例外規定も明記する
- 具体例や覚え方のコツも添える
- 試験に出やすいポイントを強調する
- 日本語で回答する`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
