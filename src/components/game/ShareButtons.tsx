"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Share2 } from "lucide-react";
import { Difficulty } from "@/types";
import { DIFFICULTY_CONFIG } from "@/constants/game";

interface ShareButtonsProps {
  score: number;
  correct: number;
  difficulty: Difficulty;
}

function buildShareText(score: number, correct: number, difficulty: Difficulty): string {
  const config = DIFFICULTY_CONFIG[difficulty];
  const maxScore = config.baseScore * 2 * 10;
  const percentage = Math.round((score / maxScore) * 100);

  // 正解数に応じた絵文字バー
  const bar = Array.from({ length: 10 })
    .map((_, i) => (i < correct ? "🟢" : "⚪"))
    .join("");

  // メッセージ
  let msg = "";
  if (correct === 10) msg = "🎉 全問正解！パーフェクト！";
  else if (correct >= 8) msg = "🌟 すごい成績！";
  else if (correct >= 5) msg = "👍 なかなかの腕前！";
  else msg = "💪 まだまだこれから！";

  return [
    `【けんちゃれ！】${config.label}モード`,
    "",
    `${bar}`,
    `正解 ${correct}/10 ・ スコア ${score.toLocaleString()}点（${percentage}%）`,
    "",
    msg,
    "",
    "都道府県当てゲームに挑戦しよう！",
  ].join("\n");
}

function getShareUrl(difficulty: Difficulty): string {
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://kenchare.vercel.app";
  return `${siteUrl}/game?from=share&d=${difficulty}`;
}

export function ShareButtons({ score, correct, difficulty }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = buildShareText(score, correct, difficulty);
  const shareUrl = getShareUrl(difficulty);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // フォールバック: 古いブラウザ
      const textarea = document.createElement("textarea");
      textarea.value = `${shareText}\n${shareUrl}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText, shareUrl]);

  const handleShareX = useCallback(() => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    const hashtags = encodeURIComponent("けんちゃれ,都道府県クイズ");
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`,
      "_blank",
      "noopener,noreferrer,width=550,height=420"
    );
  }, [shareText, shareUrl]);

  const handleShareLINE = useCallback(() => {
    const message = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(
      `https://social-plugins.line.me/lineit/share?text=${message}`,
      "_blank",
      "noopener,noreferrer,width=550,height=480"
    );
  }, [shareText, shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: "けんちゃれ！ 結果",
        text: shareText,
        url: shareUrl,
      });
    } catch {
      // ユーザーがキャンセルした場合
    }
  }, [shareText, shareUrl]);

  const supportsNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="space-y-3">
      <p className="text-center text-xs font-bold text-gray-500 tracking-wide">
        結果をシェア
      </p>
      <div className="flex gap-2.5 justify-center">
        {/* X (Twitter) */}
        <button
          type="button"
          onClick={handleShareX}
          aria-label="Xでシェア"
          className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* LINE */}
        <button
          type="button"
          onClick={handleShareLINE}
          aria-label="LINEでシェア"
          className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-[#06C755] text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.173-.508.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
        </button>

        {/* コピー */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="結果をコピー"
          className={`group flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95 ${
            copied
              ? "bg-green-500 text-white"
              : "bg-white border-2 border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500"
          }`}
        >
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
        </button>

        {/* Web Share API (モバイル) */}
        {supportsNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            aria-label="その他のアプリでシェア"
            className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-400 text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95"
          >
            <Share2 className="h-5 w-5" />
          </button>
        )}
      </div>
      {copied && (
        <p className="text-center text-xs text-green-600 font-semibold animate-in fade-in duration-200">
          コピーしました！
        </p>
      )}
    </div>
  );
}
