"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "民法の意思表示の瑕疵について教えて",
  "宅建業の免許が必要なのはどんな場合？",
  "重要事項説明書の記載事項を教えて",
  "都市計画区域と準都市計画区域の違いは？",
  "農地法3条・4条・5条の違いを教えて",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "こんにちは！宅建試験の勉強をサポートするAIアシスタントです。\n\n権利関係・宅建業法・法令上の制限・税その他・5問免除科目など、どんな質問でも気軽に聞いてください！",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || loading) return;

    setInput("");
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: msg },
    ];
    setMessages(newMessages);
    setLoading(true);

    const apiMessages = newMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantText,
          };
          return updated;
        });
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "エラーが発生しました。APIキーを確認してください。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">AI質問チャット</h1>
        <p className="text-sm text-gray-500 mt-1">
          宅建に関する質問をAIに聞いてみましょう
        </p>
      </div>

      {/* クイック質問 */}
      <div className="flex gap-2 flex-wrap mb-3">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={loading}
            className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50 hover:border-blue-300 transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* メッセージ一覧 */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="h-full overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-900 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      {/* 入力エリア */}
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="宅建に関する質問を入力..."
          disabled={loading}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <Button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          size="icon"
          className="rounded-xl h-10 w-10"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
