import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Difficulty } from "@/types";
import { DIFFICULTY_CONFIG, RANKING_DISPLAY_COUNT } from "@/constants/game";
import { Trophy, Medal, Crown, Star, Gamepad2, LogIn } from "lucide-react";

export const metadata = { title: "ランキング | けんちゃれ！" };

interface RankingPageProps {
  searchParams: Promise<{ tab?: string }>;
}

interface BestScoreRow {
  user_id: string;
  email: string;
  difficulty: string;
  score: number;
  correct_count: number;
  played_at: string;
}

function maskEmail(email: string): string {
  const atIdx = email.indexOf("@");
  if (atIdx <= 0) return "***";
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  const visible = local.slice(0, Math.min(3, local.length));
  return `${visible}***${domain}`;
}

const DIFFICULTY_TABS: { key: Difficulty; label: string; emoji: string; color: string; activeColor: string }[] = [
  { key: "easy",   label: "かんたん",   emoji: "😊", color: "border-green-200 text-green-700 hover:bg-green-50",  activeColor: "bg-green-400 text-white border-green-400 shadow-md" },
  { key: "normal", label: "ふつう",     emoji: "🤔", color: "border-blue-200 text-blue-700 hover:bg-blue-50",    activeColor: "bg-blue-400 text-white border-blue-400 shadow-md" },
  { key: "hard",   label: "むずかしい", emoji: "🔥", color: "border-red-200 text-red-700 hover:bg-red-50",       activeColor: "bg-red-400 text-white border-red-400 shadow-md" },
];

const MEDAL_COLORS = [
  { bg: "bg-yellow-100", text: "text-yellow-600", border: "border-yellow-200", icon: <Crown className="w-4 h-4" /> },
  { bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-200",   icon: <Medal className="w-4 h-4" /> },
  { bg: "bg-orange-100", text: "text-orange-500", border: "border-orange-200", icon: <Medal className="w-4 h-4" /> },
];

export default async function RankingPage({ searchParams }: RankingPageProps) {
  const { tab } = await searchParams;
  const difficulty = (["easy", "normal", "hard"].includes(tab ?? "") ? tab : "easy") as Difficulty;
  const diffConfig = DIFFICULTY_CONFIG[difficulty];
  const currentTab = DIFFICULTY_TABS.find((t) => t.key === difficulty)!;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 難易度別ベストスコアランキング（上位20件）
  const { data: ranking, error } = await supabase
    .from("best_scores")
    .select("user_id, email, difficulty, score, correct_count, played_at")
    .eq("difficulty", difficulty)
    .order("score", { ascending: false })
    .limit(RANKING_DISPLAY_COUNT);

  const rows = (ranking ?? []) as BestScoreRow[];

  // 自分のランク
  let myRank: number | null = null;
  let myScore: number | null = null;
  const myIndexInTop = user ? rows.findIndex((r) => r.user_id === user.id) : -1;

  if (user && myIndexInTop === -1) {
    const { data: myBest } = await supabase
      .from("best_scores")
      .select("score")
      .eq("user_id", user.id)
      .eq("difficulty", difficulty)
      .maybeSingle();

    if (myBest) {
      myScore = myBest.score;
      const { count } = await supabase
        .from("best_scores")
        .select("*", { count: "exact", head: true })
        .eq("difficulty", difficulty)
        .gt("score", myScore);
      myRank = (count ?? 0) + 1;
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-yellow-400 shadow-lg shadow-yellow-200 mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">ランキング</h1>
          <p className="text-sm text-gray-500 mt-1">難易度別・全ユーザーのベストスコア上位{RANKING_DISPLAY_COUNT}位</p>
        </div>

        {/* 難易度タブ */}
        <div className="flex gap-2 justify-center mb-6">
          {DIFFICULTY_TABS.map((t) => {
            const isActive = t.key === difficulty;
            return (
              <Link key={t.key} href={`/ranking?tab=${t.key}`}>
                <button
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl border-2 font-bold text-sm transition-all ${
                    isActive ? t.activeColor : `bg-white ${t.color}`
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              </Link>
            );
          })}
        </div>

        {/* 最大スコア情報 */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <Badge className={`rounded-full text-xs font-bold px-3 py-1 ${
            difficulty === "easy" ? "bg-green-100 text-green-700" :
            difficulty === "normal" ? "bg-blue-100 text-blue-700" :
            "bg-red-100 text-red-700"
          }`}>
            {currentTab.emoji} {diffConfig.label}
          </Badge>
          <span className="text-xs text-gray-400">基本点 {diffConfig.baseScore}点・最大スコア {(diffConfig.baseScore * 2 * 10).toLocaleString()}点</span>
        </div>

        {/* ランキングテーブル */}
        <Card className="border-2 border-orange-100 rounded-3xl shadow-lg overflow-hidden">
          {error && (
            <CardContent className="py-12 text-center text-gray-400">
              <p>データの取得に失敗しました。</p>
            </CardContent>
          )}

          {!error && rows.length === 0 && (
            <CardContent className="py-16 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-gray-500 font-bold mb-1">まだランキングデータがありません</p>
              <p className="text-xs text-gray-400 mb-6">ゲームをプレイしてランキングに載ろう！</p>
              <Link href={`/game/play?difficulty=${difficulty}`}>
                <Button className="gap-2 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-bold shadow-sm">
                  <Gamepad2 className="w-4 h-4" />
                  ゲームスタート！
                </Button>
              </Link>
            </CardContent>
          )}

          {!error && rows.length > 0 && (
            <div>
              {/* テーブルヘッダー */}
              <div className="bg-orange-50 border-b-2 border-orange-100 px-4 py-3 grid grid-cols-[3rem_1fr_6rem_4rem_5rem] gap-2 text-xs font-bold text-gray-500">
                <span className="text-center">順位</span>
                <span>ユーザー</span>
                <span className="text-right">スコア</span>
                <span className="text-center">正解</span>
                <span className="text-right">日付</span>
              </div>

              {/* ランキング行 */}
              {rows.map((row, index) => {
                const rank = index + 1;
                const medal = MEDAL_COLORS[index] ?? null;
                const isMe = user?.id === row.user_id;

                return (
                  <div
                    key={`${row.user_id}-${row.score}`}
                    className={`grid grid-cols-[3rem_1fr_6rem_4rem_5rem] gap-2 items-center px-4 py-3 border-b border-orange-50 transition-colors ${
                      isMe
                        ? "bg-orange-50 border-orange-200"
                        : "hover:bg-amber-50/50"
                    }`}
                  >
                    {/* 順位 */}
                    <div className="flex justify-center">
                      {medal ? (
                        <div
                          className={`w-8 h-8 rounded-full border-2 ${medal.bg} ${medal.border} ${medal.text} flex items-center justify-center`}
                        >
                          {medal.icon}
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-gray-400 w-8 text-center">
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* ユーザー */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-semibold text-gray-700 truncate">
                        {maskEmail(row.email)}
                      </span>
                      {isMe && (
                        <Badge className="rounded-full bg-orange-400 text-white text-[10px] px-1.5 py-0 shrink-0">
                          あなた
                        </Badge>
                      )}
                    </div>

                    {/* スコア */}
                    <div className="text-right">
                      <span
                        className={`font-extrabold ${
                          rank === 1
                            ? "text-yellow-500 text-base"
                            : rank <= 3
                            ? "text-orange-500 text-sm"
                            : "text-gray-700 text-sm"
                        }`}
                      >
                        {row.score.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 ml-0.5">点</span>
                    </div>

                    {/* 正解数 */}
                    <div className="text-center">
                      <span className="text-sm font-bold text-gray-600">{row.correct_count}</span>
                      <span className="text-xs text-gray-400">/10</span>
                    </div>

                    {/* 日付 */}
                    <div className="text-right text-xs text-gray-400">
                      {formatDate(row.played_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* 自分のランク（上位20位外の場合） */}
        {user && myIndexInTop === -1 && myRank !== null && myScore !== null && (
          <Card className="mt-4 border-2 border-orange-200 rounded-2xl shadow-sm">
            <CardContent className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center">
                  <Star className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">あなたの順位</p>
                  <p className="text-sm font-bold text-gray-700">{myRank}位</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">ベストスコア</p>
                <p className="text-base font-extrabold text-orange-500">{myScore.toLocaleString()}点</p>
              </div>
              <Link href={`/game/play?difficulty=${difficulty}`}>
                <Button size="sm" className="rounded-xl bg-orange-400 hover:bg-orange-500 text-white font-bold text-xs gap-1 shadow-sm">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  挑戦！
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 未ログイン案内 */}
        {!user && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-3">
              ランキングに載るには登録またはログインが必要です
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-2 border-orange-200 text-orange-500 hover:bg-orange-50 font-bold">
                  <LogIn className="w-4 h-4" />
                  ログイン
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gap-1.5 rounded-xl bg-orange-400 hover:bg-orange-500 text-white font-bold shadow-sm">
                  無料登録
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ゲームへのリンク */}
        <div className="mt-8 text-center">
          <Link href={`/game/play?difficulty=${difficulty}`}>
            <Button className="gap-2 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white font-bold shadow-md px-8 h-11">
              <Gamepad2 className="w-4 h-4" />
              {currentTab.emoji} {diffConfig.label}でゲームスタート！
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
