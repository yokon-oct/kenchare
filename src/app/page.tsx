import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Trophy,
  Zap,
  Clock,
  Star,
  ChevronRight,
  Map,
} from "lucide-react";
import { DIFFICULTY_CONFIG } from "@/constants/game";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 text-center">
        {/* 背景装飾 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 left-1/4 h-64 w-64 rounded-full bg-orange-200 opacity-20 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-48 w-48 rounded-full bg-yellow-200 opacity-30 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-200 opacity-20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl">
          {/* アイコン */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-400 shadow-xl shadow-orange-200">
              <MapPin className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* タイトル */}
          <h1 className="mb-3 text-5xl font-extrabold tracking-tight text-gray-800 sm:text-6xl">
            けんちゃれ！
          </h1>
          <p className="mb-2 text-xl font-bold text-orange-500">
            都道府県当てゲーム
          </p>
          <p className="mb-10 text-base text-gray-500 leading-relaxed">
            ヒントを読んで、日本地図の正しい都道府県をクリック！
            <br />
            知識と反射速度で高得点を目指そう。
          </p>

          {/* CTAボタン */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/game">
              <Button className="h-14 gap-2 rounded-2xl bg-orange-400 px-10 text-lg font-extrabold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-1 hover:bg-orange-500 hover:shadow-xl">
                <Zap className="h-5 w-5" />
                ゲームスタート！
              </Button>
            </Link>
            <Link href="/ranking">
              <Button
                variant="outline"
                className="h-14 gap-2 rounded-2xl border-2 border-orange-200 px-8 text-base font-bold text-orange-500 hover:bg-orange-50"
              >
                <Trophy className="h-5 w-5" />
                ランキングを見る
              </Button>
            </Link>
          </div>

          {/* ログイン促進 */}
          {!user && (
            <p className="mt-5 text-sm text-gray-400">
              スコアを保存するには{" "}
              <Link
                href="/register"
                className="font-semibold text-orange-400 hover:underline"
              >
                無料登録
              </Link>{" "}
              または{" "}
              <Link
                href="/login"
                className="font-semibold text-orange-400 hover:underline"
              >
                ログイン
              </Link>
            </p>
          )}
          {user && (
            <p className="mt-5 text-sm text-gray-400">
              ようこそ、
              <span className="font-semibold text-gray-600">{user.email}</span>{" "}
              さん！
            </p>
          )}
        </div>
      </section>

      {/* 難易度紹介セクション */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-extrabold text-gray-700">
            3つの難易度から選ぼう
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                {
                  key: "easy",
                  emoji: "😊",
                  color: "bg-green-50 border-green-200",
                  badgeColor: "bg-green-100 text-green-700",
                  icon: <Star className="h-4 w-4" />,
                },
                {
                  key: "normal",
                  emoji: "🤔",
                  color: "bg-blue-50 border-blue-200",
                  badgeColor: "bg-blue-100 text-blue-700",
                  icon: <Star className="h-4 w-4" />,
                },
                {
                  key: "hard",
                  emoji: "🔥",
                  color: "bg-red-50 border-red-200",
                  badgeColor: "bg-red-100 text-red-700",
                  icon: <Star className="h-4 w-4" />,
                },
              ] as const
            ).map(({ key, emoji, color, badgeColor }) => {
              const config = DIFFICULTY_CONFIG[key];
              return (
                <Card
                  key={key}
                  className={`border-2 ${color} rounded-2xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md`}
                >
                  <CardContent className="p-5 text-center">
                    <div className="mb-3 text-4xl">{emoji}</div>
                    <div
                      className={`mb-2 inline-block rounded-full px-3 py-1 text-sm font-bold ${badgeColor}`}
                    >
                      {config.label}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2">
                      {config.description}
                    </p>
                    <p className="mt-3 text-lg font-extrabold text-gray-700">
                      最大{(config.baseScore * 2 * 10).toLocaleString()}点
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ゲームの流れセクション */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-extrabold text-gray-700">
            遊び方
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                icon: <Star className="h-6 w-6 text-orange-400" />,
                title: "難易度を選ぶ",
                desc: "かんたん・ふつう・むずかしいの3段階から選択",
              },
              {
                step: "2",
                icon: <Clock className="h-6 w-6 text-orange-400" />,
                title: "ヒントを読む",
                desc: "30秒以内に都道府県の特徴ヒントを読んで考える",
              },
              {
                step: "3",
                icon: <Map className="h-6 w-6 text-orange-400" />,
                title: "地図をクリック",
                desc: "正しい都道府県の場所を地図上でタップ！早いほど高得点",
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 shadow-sm">
                  {icon}
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <Badge className="rounded-full bg-orange-400 text-white text-xs px-2">
                    STEP {step}
                  </Badge>
                </div>
                <h3 className="mb-1 text-base font-extrabold text-gray-700">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className="px-4 py-16 text-center">
        <div className="mx-auto max-w-md">
          <h2 className="mb-3 text-2xl font-extrabold text-gray-700">
            さあ、挑戦しよう！
          </h2>
          <p className="mb-8 text-sm text-gray-500">
            全10問・毎回ランダム出題。何度でも遊べる！
          </p>
          <Link href="/game">
            <Button className="h-14 w-full gap-2 rounded-2xl bg-orange-400 text-lg font-extrabold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-1 hover:bg-orange-500 hover:shadow-xl sm:w-auto sm:px-16">
              ゲームスタート！
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
