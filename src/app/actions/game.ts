"use server";

import { createClient } from "@/lib/supabase/server";
import { Difficulty } from "@/types";
import { DIFFICULTY_CONFIG } from "@/constants/game";

/**
 * ゲームスコアをDBに保存するサーバーアクション。
 * - 難易度・スコア・正解数の範囲を必ずサーバー側でバリデートする
 * - ログインユーザーのみ保存（未ログインは success: false を返すだけ）
 */
export async function saveScore({
  difficulty,
  score,
  correctCount,
}: {
  difficulty: string;
  score: number;
  correctCount: number;
}): Promise<{ success: boolean; isNewBest: boolean; error?: string }> {
  // 難易度バリデーション
  if (!["easy", "normal", "hard"].includes(difficulty)) {
    return { success: false, isNewBest: false, error: "無効な難易度" };
  }

  const diff = difficulty as Difficulty;
  const config = DIFFICULTY_CONFIG[diff];
  const maxScore = config.baseScore * 2 * 10;

  // スコア・正解数を安全な範囲にクランプ（URL改ざん対策）
  const safeScore = Math.max(0, Math.min(Math.round(score), maxScore));
  const safeCorrect = Math.max(0, Math.min(Math.round(correctCount), 10));

  if (safeScore <= 0) {
    return { success: false, isNewBest: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, isNewBest: false, error: "未ログイン" };
  }

  // 現在のベストスコアを取得
  const { data: existing } = await supabase
    .from("scores")
    .select("score")
    .eq("user_id", user.id)
    .eq("difficulty", diff)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();

  const prevBest = existing?.score ?? 0;
  const isNewBest = safeScore > prevBest;

  const { error } = await supabase.from("scores").insert({
    user_id: user.id,
    difficulty: diff,
    score: safeScore,
    correct_count: safeCorrect,
  });

  if (error) {
    return { success: false, isNewBest: false, error: error.message };
  }

  return { success: true, isNewBest };
}
