"use client";

import { useEffect, useState } from "react";
import { saveScore } from "@/app/actions/game";
import { Difficulty } from "@/types";

interface StoredGameResults {
  results: Array<{ isCorrect: boolean }>;
  totalScore: number;
  difficulty: Difficulty;
  saved?: boolean;
}

interface Props {
  difficulty: Difficulty;
}

/**
 * マウント時に sessionStorage のゲーム結果を読み取り、
 * サーバーアクション経由でスコアを保存するクライアントコンポーネント。
 *
 * - sessionStorage の `saved` フラグで重複保存を防止
 * - difficulty の一致確認でURLパラメータ改ざんを検知
 * - ベストスコア更新時のみバッジを表示
 */
export function SaveScoreEffect({ difficulty }: Props) {
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    const doSave = async () => {
      try {
        const raw = sessionStorage.getItem("gameResults");
        if (!raw) return;

        const gameData: StoredGameResults = JSON.parse(raw);

        // ページリフレッシュによる重複保存を防止
        if (gameData.saved) return;

        // URLパラメータとsessionStorageの難易度が一致しない場合は保存しない
        if (gameData.difficulty !== difficulty) return;

        // 先に保存済みフラグを立てて、非同期処理中の二重実行を防ぐ
        gameData.saved = true;
        sessionStorage.setItem("gameResults", JSON.stringify(gameData));

        const correctCount = gameData.results.filter((r) => r.isCorrect).length;

        const result = await saveScore({
          difficulty: gameData.difficulty,
          score: gameData.totalScore,
          correctCount,
        });

        if (result.isNewBest) {
          setIsNewBest(true);
        }
      } catch {
        // sessionStorage が利用できない環境は無視
      }
    };

    doSave();
    // difficulty は初回マウント時のみ参照するため依存配列から除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isNewBest) return null;

  return (
    <div className="inline-flex items-center gap-1 bg-yellow-300/30 border border-yellow-200 rounded-full px-3 py-1 text-xs font-bold text-yellow-100 mb-3">
      🏆 ベストスコア更新！
    </div>
  );
}
