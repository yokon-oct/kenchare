import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Difficulty } from "@/types";
import { DIFFICULTY_CONFIG } from "@/constants/game";
import {
  User,
  Trophy,
  Star,
  Gamepad2,
  CheckCircle2,
  XCircle,
  CalendarDays,
  TrendingUp,
  Crown,
} from "lucide-react";

export const metadata = { title: "マイページ | けんちゃれ！" };

interface BestScoreRow {
  user_id: string;
  difficulty: string;
  score: number;
  correct_count: number;
  played_at: string;
}

interface ScoreRow {
  id: string;
  difficulty: string;
  score: number;
  correct_count: number;
  played_at: string;
}

interface ProfileRow {
  email: string;
  created_at: string;
}

const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

const DIFF_STYLE: Record<Difficulty, { bg: string; border: string; badge: string; text: string; emoji: string }> = {
  easy:   { bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-100 text-green-700",   text: "text-green-600",  emoji: "😊" },
  normal: { bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-700",     text: "text-blue-600",   emoji: "🤔" },
  hard:   { bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-700",       text: "text-red-600",    emoji: "🔥" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // プロフィール取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, created_at")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  // 難易度別ベストスコア取得
  const { data: bestScores } = await supabase
    .from("best_scores")
    .select("user_id, difficulty, score, correct_count, played_at")
    .eq("user_id", user.id);

  const bestMap = Object.fromEntries(
    (bestScores ?? []).map((r: BestScoreRow) => [r.difficulty, r])
  );

  // 各難易度の全体順位を並列取得（Promise.all でシリアルN+1を解消）
  const rankEntries = await Promise.all(
    DIFFICULTIES.map(async (diff) => {
      const myBest = bestMap[diff];
      if (!myBest) return [diff, null] as const;
      const { count } = await supabase
        .from("best_scores")
        .select("*", { count: "exact", head: true })
        .eq("difficulty", diff)
        .gt("score", myBest.score);
      return [diff, (count ?? 0) + 1] as const;
    })
  );
  const rankMap = Object.fromEntries(rankEntries) as Record<string, number | null>;

  // プレイ履歴（最新20件）
  const { data: history } = await supabase
    .from("scores")
    .select("id, difficulty, score, correct_count, played_at")
    .eq("user_id", user.id)
    .order("played_at", { ascending: false })
    .limit(20);

  const historyRows = (history ?? []) as ScoreRow[];

  // 総プレイ回数・総正解数
  const totalPlays = historyRows.length;
  const totalCorrect = historyRows.reduce((s, r) => s + r.correct_count, 0);
  const totalQuestions = totalPlays * 10;
  const accuracyPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const displayEmail = profile?.email ?? user.email ?? "";

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* ユーザー情報カード */}
        <Card className="border-2 border-orange-100 rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-linear-to-br from-orange-400 to-amber-400 px-6 py-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-orange-100 text-xs mb-0.5">ユーザー</p>
              <p className="text-white font-extrabold text-lg truncate">{displayEmail}</p>
              {profile?.created_at && (
                <p className="text-orange-100 text-xs mt-0.5 flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {formatDate(profile.created_at)} 登録
                </p>
              )}
            </div>
          </div>

          {/* 統計サマリー */}
          <CardContent className="px-6 py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-extrabold text-gray-700">{totalPlays}</p>
                <p className="text-xs text-gray-400 mt-0.5">プレイ回数</p>
              </div>
              <div className="border-x border-gray-100">
                <p className="text-2xl font-extrabold text-gray-700">{totalCorrect}</p>
                <p className="text-xs text-gray-400 mt-0.5">総正解数</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-700">{accuracyPct}%</p>
                <p className="text-xs text-gray-400 mt-0.5">正答率</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ベストスコアセクション */}
        <div>
          <h2 className="flex items-center gap-2 font-extrabold text-gray-700 text-lg mb-3">
            <Trophy className="w-5 h-5 text-yellow-400" />
            難易度別ベストスコア
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {DIFFICULTIES.map((diff) => {
              const config = DIFFICULTY_CONFIG[diff];
              const style = DIFF_STYLE[diff];
              const best = bestMap[diff] as BestScoreRow | undefined;
              const rank = rankMap[diff];
              const maxScore = config.baseScore * 2 * 10;

              return (
                <Card
                  key={diff}
                  className={`border-2 ${style.border} ${style.bg} rounded-2xl shadow-sm`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={`rounded-full text-xs font-bold px-2.5 py-0.5 ${style.badge}`}>
                        {style.emoji} {config.label}
                      </Badge>
                      {rank !== null && rank <= 3 && (
                        <Crown className={`w-4 h-4 ${rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-400" : "text-orange-400"}`} />
                      )}
                    </div>

                    {best ? (
                      <>
                        <p className={`text-3xl font-extrabold ${style.text} leading-none mb-1`}>
                          {best.score.toLocaleString()}
                          <span className="text-sm font-normal text-gray-400 ml-1">点</span>
                        </p>
                        <p className="text-xs text-gray-400 mb-2">
                          最大{maxScore.toLocaleString()}点中
                        </p>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            <span>正解 {best.correct_count}/10</span>
                          </div>
                          {rank !== null && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                              <span>全体 {rank}位</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>{formatDate(best.played_at)}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-2xl mb-1">🎯</p>
                        <p className="text-xs text-gray-400">未プレイ</p>
                      </div>
                    )}

                    <Link href={`/game/play?difficulty=${diff}`} className="block mt-3">
                      <Button
                        size="sm"
                        className={`w-full rounded-xl text-xs font-bold gap-1 ${
                          diff === "easy"
                            ? "bg-green-400 hover:bg-green-500"
                            : diff === "normal"
                            ? "bg-blue-400 hover:bg-blue-500"
                            : "bg-red-400 hover:bg-red-500"
                        } text-white shadow-sm`}
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        {best ? "もう一度" : "挑戦する"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* プレイ履歴セクション */}
        <div>
          <h2 className="flex items-center gap-2 font-extrabold text-gray-700 text-lg mb-3">
            <Star className="w-5 h-5 text-orange-400" />
            最近のプレイ履歴
            {historyRows.length > 0 && (
              <span className="text-xs font-normal text-gray-400">（直近{historyRows.length}件）</span>
            )}
          </h2>

          {historyRows.length === 0 ? (
            <Card className="border-2 border-orange-100 rounded-2xl shadow-sm">
              <CardContent className="py-10 text-center">
                <p className="text-4xl mb-3">🎮</p>
                <p className="text-gray-500 font-bold mb-1">まだプレイ履歴がありません</p>
                <p className="text-xs text-gray-400 mb-5">ゲームをプレイして記録を残そう！</p>
                <Link href="/game">
                  <Button className="gap-2 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-bold shadow-sm">
                    <Gamepad2 className="w-4 h-4" />
                    ゲームスタート！
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-orange-100 rounded-3xl shadow-lg overflow-hidden">
              {/* テーブルヘッダー */}
              <div className="bg-orange-50 border-b-2 border-orange-100 px-4 py-3 grid grid-cols-[5rem_1fr_4rem_9rem] gap-2 text-xs font-bold text-gray-500">
                <span>難易度</span>
                <span className="text-right">スコア</span>
                <span className="text-center">正解</span>
                <span className="text-right">日時</span>
              </div>

              {historyRows.map((row, i) => {
                const diff = row.difficulty as Difficulty;
                const config = DIFFICULTY_CONFIG[diff];
                const style = DIFF_STYLE[diff];

                return (
                  <div
                    key={row.id}
                    className={`grid grid-cols-[5rem_1fr_4rem_9rem] gap-2 items-center px-4 py-3 border-b border-orange-50 ${
                      i % 2 === 0 ? "bg-white" : "bg-orange-50/30"
                    }`}
                  >
                    {/* 難易度 */}
                    <div>
                      <Badge className={`rounded-full text-[10px] font-bold px-2 py-0 ${style.badge}`}>
                        {style.emoji} {config.label}
                      </Badge>
                    </div>

                    {/* スコア */}
                    <div className="text-right">
                      <span className="font-extrabold text-gray-700 text-sm">
                        {row.score.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 ml-0.5">点</span>
                    </div>

                    {/* 正解数 */}
                    <div className="flex items-center justify-center gap-1">
                      {row.correct_count >= 8 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      ) : row.correct_count >= 5 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-gray-600">{row.correct_count}</span>
                      <span className="text-xs text-gray-400">/10</span>
                    </div>

                    {/* 日時 */}
                    <div className="text-right text-xs text-gray-400">
                      {formatDateTime(row.played_at)}
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          <Link href="/game" className="flex-1">
            <Button className="w-full gap-2 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-bold shadow-md h-11">
              <Gamepad2 className="w-4 h-4" />
              ゲームをプレイする
            </Button>
          </Link>
          <Link href="/ranking" className="flex-1">
            <Button
              variant="outline"
              className="w-full gap-2 rounded-2xl border-2 border-orange-200 text-orange-500 hover:bg-orange-50 font-bold h-11"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              ランキングを見る
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
