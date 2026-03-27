export type Difficulty = "easy" | "normal" | "hard";

export interface Prefecture {
  id: number;
  name: string;
  region: string;
  svg_id: string;
}

export interface Hint {
  id: number;
  prefecture_id: number;
  difficulty: Difficulty;
  content: string;
}

export interface Score {
  id: string;
  user_id: string;
  difficulty: Difficulty;
  score: number;
  correct_count: number;
  played_at: string;
}

export interface RankingEntry {
  rank: number;
  user_id: string;
  email: string;
  score: number;
  correct_count: number;
  played_at: string;
}

export interface GameQuestion {
  prefecture: Prefecture;
  hint: Hint;
}

export interface GameResult {
  questionIndex: number;
  prefecture: Prefecture;
  answeredSvgId: string | null;
  isCorrect: boolean;
  points: number;
  timeUsed: number;
}
