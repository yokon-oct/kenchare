import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Difficulty } from "@/types";
import { DIFFICULTY_CONFIG } from "@/constants/game";
import { Trophy, RotateCcw, Star, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { SaveScoreEffect } from "./SaveScoreEffect";

interface ResultPageProps {
  searchParams: Promise<{
    score?: string;
    difficulty?: string;
    correct?: string;
  }>;
}

export const metadata = { title: "結果 | けんちゃれ！" };

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const {
    score: rawScore,
    difficulty: rawDifficulty,
    correct: rawCorrect,
  } = await searchParams;

  // URL パラメータは表示のみに使用。DB 保存は SaveScoreEffect（クライアント）が担当。
  const score = Math.max(0, parseInt(rawScore ?? "0", 10));
  const correct = Math.max(0, Math.min(parseInt(rawCorrect ?? "0", 10), 10));
  const difficulty = (
    ["easy", "normal", "hard"].includes(rawDifficulty ?? "")
      ? rawDifficulty
      : "easy"
  ) as Difficulty;
  const diffConfig = DIFFICULTY_CONFIG[difficulty];

  // ログイン状態の確認（未ログイン案内の表示のみに使用）
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const maxScore = diffConfig.baseScore * 2 * 10;
  const percentage = Math.round((score / maxScore) * 100);

  const getMessage = () => {
    if (correct === 10) return "🎉 全問正解！パーフェクト！！";
    if (correct >= 8) return "🌟 すごい！あと少しで満点！";
    if (correct >= 5) return "👍 まずまずの成績！練習あるのみ！";
    return "😅 もう一度チャレンジしてみよう！";
  };

  const getStarCount = () => {
    if (correct === 10) return 3;
    if (correct >= 6) return 2;
    return 1;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 px-4 py-12">
      <div className="mx-auto max-w-md">
        {/* メイン結果カード */}
        <Card className="border-2 border-orange-200 rounded-3xl shadow-xl mb-6 overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-linear-to-br from-orange-400 to-amber-400 px-8 pt-8 pb-10 text-center text-white">
            <div className="flex justify-center gap-1 mb-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 ${i < getStarCount() ? "fill-yellow-300 text-yellow-300" : "text-orange-300 opacity-40"}`}
                />
              ))}
            </div>

            {/* ベストスコア更新バッジ：SaveScoreEffect が保存完了後にレンダリング */}
            <SaveScoreEffect difficulty={difficulty} />

            <p className="text-orange-100 text-sm mb-1">{diffConfig.label}モード</p>
            <p className="text-6xl font-extrabold mb-1">
              {score.toLocaleString()}
            </p>
            <p className="text-orange-200 text-sm">
              最大{maxScore.toLocaleString()}点中（{percentage}%）
            </p>
          </div>

          <CardContent className="p-6">
            {/* 正解数 */}
            <div className="flex justify-center gap-10 mb-5">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-green-600 mb-1">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-3xl font-extrabold">{correct}</span>
                </div>
                <p className="text-xs text-gray-500">正解</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-red-400 mb-1">
                  <XCircle className="w-5 h-5" />
                  <span className="text-3xl font-extrabold">
                    {10 - correct}
                  </span>
                </div>
                <p className="text-xs text-gray-500">不正解</p>
              </div>
            </div>

            <p className="text-center text-base font-bold text-gray-700">
              {getMessage()}
            </p>
          </CardContent>
        </Card>

        {/* アクションボタン */}
        <div className="flex flex-col gap-3">
          <Link href={`/game/play?difficulty=${difficulty}`}>
            <Button className="w-full h-12 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-bold gap-2 shadow-md">
              <RotateCcw className="w-4 h-4" />
              もう一度（{diffConfig.label}）
            </Button>
          </Link>
          <Link href="/game">
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 border-orange-200 text-orange-500 hover:bg-orange-50 font-bold"
            >
              難易度を変える
            </Button>
          </Link>
          <Link href="/ranking">
            <Button
              variant="ghost"
              className="w-full h-12 rounded-2xl text-gray-600 font-bold gap-2 hover:bg-orange-50"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              ランキングを見る
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* 未ログインへの案内 */}
        {!user && (
          <p className="text-center text-xs text-gray-400 mt-5">
            スコアを保存するには{" "}
            <Link
              href="/register"
              className="text-orange-400 font-semibold hover:underline"
            >
              無料登録
            </Link>{" "}
            または{" "}
            <Link
              href="/login"
              className="text-orange-400 font-semibold hover:underline"
            >
              ログイン
            </Link>{" "}
            が必要です
          </p>
        )}
      </div>
    </div>
  );
}
