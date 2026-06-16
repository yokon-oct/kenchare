import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "かんたん",
  normal: "ふつう",
  hard: "むずかしい",
};

const DIFFICULTY_BASE_SCORES: Record<string, number> = {
  easy: 100,
  normal: 200,
  hard: 300,
};

const DIFFICULTY_COLORS: Record<string, { bg: string; accent: string }> = {
  easy: { bg: "#22c55e", accent: "#bbf7d0" },
  normal: { bg: "#3b82f6", accent: "#bfdbfe" },
  hard: { bg: "#ef4444", accent: "#fecaca" },
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const score = Math.max(0, parseInt(searchParams.get("score") ?? "0", 10));
  const correct = Math.max(
    0,
    Math.min(parseInt(searchParams.get("correct") ?? "0", 10), 10)
  );
  const difficulty = (
    ["easy", "normal", "hard"].includes(searchParams.get("difficulty") ?? "")
      ? searchParams.get("difficulty")!
      : "easy"
  );

  const label = DIFFICULTY_LABELS[difficulty];
  const baseScore = DIFFICULTY_BASE_SCORES[difficulty];
  const maxScore = baseScore * 2 * 10;
  const percentage = Math.round((score / maxScore) * 100);
  const colors = DIFFICULTY_COLORS[difficulty];

  let message = "";
  if (correct === 10) message = "🎉 全問正解！パーフェクト！";
  else if (correct >= 8) message = "🌟 すごい成績！";
  else if (correct >= 5) message = "👍 なかなかの腕前！";
  else message = "💪 次はもっと頑張ろう！";

  // 正解/不正解のドット
  const dots = Array.from({ length: 10 }).map((_, i) => i < correct);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 50%, #FEF3C7 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "28px", fontWeight: 800, color: "#1f2937" }}>
            けんちゃれ！
          </span>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#9ca3af",
            }}
          >
            都道府県当てゲーム
          </span>
        </div>

        {/* Result card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            borderRadius: "32px",
            padding: "48px 80px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            border: "3px solid #fed7aa",
          }}
        >
          {/* Difficulty badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: colors.accent,
              color: colors.bg,
              borderRadius: "999px",
              padding: "6px 24px",
              fontSize: "20px",
              fontWeight: 800,
              marginBottom: "20px",
            }}
          >
            {label}モード
          </div>

          {/* Score */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "96px",
                fontWeight: 900,
                color: "#f97316",
                lineHeight: 1,
              }}
            >
              {score.toLocaleString()}
            </span>
            <span style={{ fontSize: "28px", fontWeight: 700, color: "#9ca3af" }}>
              点
            </span>
          </div>

          <span style={{ fontSize: "18px", color: "#9ca3af", marginBottom: "24px" }}>
            最大{maxScore.toLocaleString()}点中（{percentage}%）
          </span>

          {/* Dots */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {dots.map((isCorrect, i) => (
              <div
                key={i}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: isCorrect ? "#22c55e" : "#e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            ))}
          </div>

          {/* Correct / Incorrect */}
          <div style={{ display: "flex", gap: "40px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "40px", fontWeight: 900, color: "#16a34a" }}>
                {correct}
              </span>
              <span style={{ fontSize: "18px", color: "#6b7280" }}>正解</span>
            </div>
            <div
              style={{
                width: "2px",
                height: "40px",
                background: "#e5e7eb",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "40px", fontWeight: 900, color: "#f87171" }}>
                {10 - correct}
              </span>
              <span style={{ fontSize: "18px", color: "#6b7280" }}>不正解</span>
            </div>
          </div>

          {/* Message */}
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#374151" }}>
            {message}
          </span>
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "24px",
          }}
        >
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#f97316" }}>
            あなたも挑戦してみよう →
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
