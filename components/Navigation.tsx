"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BarChart2, Calendar, MessageCircle, Library, Zap, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: BarChart2 },
  { href: "/drill", label: "ドリル", icon: Zap },
  { href: "/tasks", label: "タスク", icon: ListTodo },
  { href: "/schedule", label: "スケジュール", icon: Calendar },
  { href: "/progress", label: "進捗", icon: BookOpen },
  { href: "/resources", label: "参考書", icon: Library },
  { href: "/chat", label: "AI質問", icon: MessageCircle },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 hidden lg:inline">宅建スタディ</span>
          </Link>
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0",
                  pathname === href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100",
                  href === "/drill" && pathname !== "/drill"
                    ? "text-purple-600 hover:bg-purple-50"
                    : ""
                )}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
