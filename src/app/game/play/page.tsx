import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GameClient } from "@/components/game/GameClient";
import { Difficulty, GameQuestion } from "@/types";
import { DIFFICULTY_CONFIG } from "@/constants/game";

interface PlayPageProps {
  searchParams: Promise<{ difficulty?: string }>;
}

export const metadata = { title: "ゲーム中 | けんちゃれ！" };

export default async function PlayPage({ searchParams }: PlayPageProps) {
  const { difficulty: rawDifficulty } = await searchParams;

  if (
    !rawDifficulty ||
    !Object.keys(DIFFICULTY_CONFIG).includes(rawDifficulty)
  ) {
    redirect("/game");
  }

  const difficulty = rawDifficulty as Difficulty;
  const supabase = await createClient();

  // 全都道府県を取得してシャッフル
  const { data: allPrefectures, error: prefError } = await supabase
    .from("prefectures")
    .select("*");

  if (prefError || !allPrefectures || allPrefectures.length === 0) {
    redirect("/game");
  }

  // Fisher-Yates アルゴリズムで偏りのないシャッフルを行い10件選択
  const arr = [...allPrefectures];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const shuffled = arr.slice(0, 10);

  const selectedIds = shuffled.map((p) => p.id);

  // 選択した都道府県のヒントを一括取得
  const { data: hints, error: hintError } = await supabase
    .from("hints")
    .select("*")
    .in("prefecture_id", selectedIds)
    .eq("difficulty", difficulty);

  if (hintError || !hints) {
    redirect("/game");
  }

  // 問題リストを組み立て
  const questions: GameQuestion[] = shuffled
    .map((prefecture) => {
      const prefHints = hints.filter((h) => h.prefecture_id === prefecture.id);
      if (prefHints.length === 0) return null;
      const hint = prefHints[Math.floor(Math.random() * prefHints.length)];
      return { prefecture, hint };
    })
    .filter((q): q is GameQuestion => q !== null);

  if (questions.length < 5) {
    redirect("/game");
  }

  return <GameClient questions={questions} difficulty={difficulty} />;
}
