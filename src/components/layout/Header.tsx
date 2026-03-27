import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { MapPin, Trophy, User, LogOut, LogIn } from "lucide-react";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-orange-100 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* ロゴ */}
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold text-xl text-orange-500 hover:text-orange-600 transition-colors"
        >
          <div className="bg-orange-400 rounded-xl p-1.5 shadow-sm">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:inline">けんちゃれ！</span>
        </Link>

        {/* ナビゲーション */}
        <nav className="flex items-center gap-2">
          <Link href="/ranking">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">ランキング</span>
            </Button>
          </Link>

          {user ? (
            <>
              <Link href="/mypage">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs max-w-[100px] truncate">
                    {user.email}
                  </span>
                </Button>
              </Link>

              <form action={logout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">ログアウト</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">ログイン</span>
                </Button>
              </Link>

              <Link href="/register">
                <Button
                  size="sm"
                  className="gap-1.5 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-xl shadow-sm"
                >
                  無料登録
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
