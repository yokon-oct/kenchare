"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { login } from "@/app/actions/auth";
import { MapPin, Mail, Lock, Loader2 } from "lucide-react";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="w-full max-w-md border-2 border-orange-200 shadow-xl rounded-3xl">
      <CardHeader className="pb-2 pt-8 px-8">
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="bg-orange-400 rounded-full p-3 shadow-md">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            ログイン
          </h1>
          <p className="text-sm text-gray-500">
            アカウントにサインインしてスコアを保存しよう！
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-gray-700 font-semibold">
              メールアドレス
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@mail.com"
                required
                className="pl-10 rounded-xl border-2 border-orange-100 focus:border-orange-400 focus-visible:ring-orange-300"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-gray-700 font-semibold">
              パスワード
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="pl-10 rounded-xl border-2 border-orange-100 focus:border-orange-400 focus-visible:ring-orange-300"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-orange-400 hover:bg-orange-500 text-white font-bold text-base h-11 shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ログイン中...
              </>
            ) : (
              "ログイン"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          アカウントをお持ちでない方は{" "}
          <Link
            href="/register"
            className="text-orange-500 font-semibold hover:underline"
          >
            新規登録
          </Link>
        </div>

        <div className="mt-3 text-center">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
          >
            ← ゲームをプレイするだけならログイン不要
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
