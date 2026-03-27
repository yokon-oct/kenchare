"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { register } from "@/app/actions/auth";
import { MapPin, Mail, Lock, Loader2, CheckCircle2 } from "lucide-react";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;

    if (password !== confirm) {
      setError("パスワードが一致しません。");
      return;
    }
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }

    startTransition(async () => {
      const result = await register(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <Card className="w-full max-w-md border-2 border-orange-200 shadow-xl rounded-3xl">
        <CardContent className="px-8 py-12 flex flex-col items-center gap-4 text-center">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-800">
            登録メールを送信しました！
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            ご登録のメールアドレスに確認メールを送りました。
            <br />
            メール内のリンクをクリックして登録を完了してください。
          </p>
          <Link href="/login">
            <Button className="mt-2 rounded-xl bg-orange-400 hover:bg-orange-500 text-white font-bold">
              ログインページへ
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-2 border-orange-200 shadow-xl rounded-3xl">
      <CardHeader className="pb-2 pt-8 px-8">
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="bg-orange-400 rounded-full p-3 shadow-md">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            新規登録
          </h1>
          <p className="text-sm text-gray-500">
            アカウントを作ってスコアを保存しよう！
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
              <span className="text-xs text-gray-400 ml-1 font-normal">（6文字以上）</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="pl-10 rounded-xl border-2 border-orange-100 focus:border-orange-400 focus-visible:ring-orange-300"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-gray-700 font-semibold">
              パスワード（確認）
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirm"
                name="confirm"
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
                登録中...
              </>
            ) : (
              "アカウントを作成"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          すでにアカウントをお持ちの方は{" "}
          <Link
            href="/login"
            className="text-orange-500 font-semibold hover:underline"
          >
            ログイン
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
