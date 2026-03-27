import { Difficulty } from "@/types";

export const QUESTIONS_PER_GAME = 10;
export const TIME_LIMIT_SECONDS = 30;

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; baseScore: number; description: string }
> = {
  easy: {
    label: "かんたん",
    baseScore: 100,
    description: "県庁所在地・名産品・有名な観光地など",
  },
  normal: {
    label: "ふつう",
    baseScore: 200,
    description: "地理的特徴・伝統工芸・地域文化など",
  },
  hard: {
    label: "むずかしい",
    baseScore: 300,
    description: "人口・面積ランキング・マニアックな雑学など",
  },
};

export const RANKING_DISPLAY_COUNT = 20;

/**
 * 残り時間からボーナス係数を計算（1.0〜2.0倍）
 */
export function calcTimeBonus(remainingSeconds: number): number {
  const ratio = remainingSeconds / TIME_LIMIT_SECONDS;
  return 1.0 + ratio;
}

/**
 * スコアを計算
 */
export function calcScore(
  difficulty: Difficulty,
  remainingSeconds: number
): number {
  const base = DIFFICULTY_CONFIG[difficulty].baseScore;
  const bonus = calcTimeBonus(remainingSeconds);
  return Math.round(base * bonus);
}
