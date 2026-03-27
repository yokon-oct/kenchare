import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { DIFFICULTY_CONFIG } from "@/constants/game";
import { Difficulty } from "@/types";
import { Zap, ChevronRight, Clock, Star } from "lucide-react";

export const metadata = { title: "難易度選択 | けんちゃれ！" };

const DIFFICULTY_STYLES: Record<
  Difficulty,
  { emoji: string; bg: string; border: string; badge: string; maxScore: number }
> = {
  easy: {
    emoji: "😊",
    bg: "bg-green-50 hover:bg-green-100",
    border: "border-green-300",
    badge: "bg-green-100 text-green-700 border-green-200",
    maxScore: 2000,
  },
  normal: {
    emoji: "🤔",
    bg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-300",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    maxScore: 4000,
  },
  hard: {
    emoji: "🔥",
    bg: "bg-red-50 hover:bg-red-100",
    border: "border-red-300",
    badge: "bg-red-100 text-red-700 border-red-200",
    maxScore: 6000,
  },
};

export default function GamePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-400 rounded-2xl shadow-lg mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-3">
            難易度を選ぼう
          </h1>
          <div className="flex items-center justify-center gap-5 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" /> 全10問
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-orange-400" /> 各30秒
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {(
            Object.entries(DIFFICULTY_CONFIG) as [
              Difficulty,
              (typeof DIFFICULTY_CONFIG)[Difficulty],
            ][]
          ).map(([key, config]) => {
            const style = DIFFICULTY_STYLES[key];
            return (
              <Link key={key} href={`/game/play?difficulty=${key}`}>
                <Card
                  className={`border-2 ${style.border} ${style.bg} rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{style.emoji}</span>
                        <div>
                          <span
                            className={`inline-block text-xs font-bold px-3 py-0.5 rounded-full border ${style.badge} mb-1.5`}
                          >
                            {config.label}
                          </span>
                          <p className="text-sm text-gray-500">
                            {config.description}
                          </p>
                          <p className="text-base font-bold text-gray-700 mt-1">
                            最大{" "}
                            <span className="text-lg">
                              {style.maxScore.toLocaleString()}
                            </span>
                            点
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
