"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { JapanMap } from "@/components/map/JapanMap";
import { Badge } from "@/components/ui/badge";
import {
  calcScore,
  DIFFICULTY_CONFIG,
  TIME_LIMIT_SECONDS,
} from "@/constants/game";
import { GameQuestion, GameResult, Difficulty } from "@/types";
import { Clock, Star, MapPin, CheckCircle2, XCircle } from "lucide-react";

const ANSWER_DISPLAY_MS = 2000;

interface GameClientProps {
  questions: GameQuestion[];
  difficulty: Difficulty;
}

export function GameClient({ questions, difficulty }: GameClientProps) {
  const router = useRouter();
  const isAnsweringRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const [phase, setPhase] = useState<"playing" | "answered">("playing");
  const [selectedSvgId, setSelectedSvgId] = useState<string | null>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [lastPoints, setLastPoints] = useState<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const diffConfig = DIFFICULTY_CONFIG[difficulty];

  const recordAnswer = useCallback(
    (clickedId: string | null) => {
      if (isAnsweringRef.current) return;
      isAnsweringRef.current = true;

      const isCorrect = clickedId === currentQuestion.prefecture.svg_id;
      const points = isCorrect ? calcScore(difficulty, timeLeft) : 0;

      const result: GameResult = {
        questionIndex: currentIndex,
        prefecture: currentQuestion.prefecture,
        answeredSvgId: clickedId,
        isCorrect,
        points,
        timeUsed: TIME_LIMIT_SECONDS - timeLeft,
      };

      const newResults = [...results, result];
      const newScore = totalScore + points;

      setSelectedSvgId(clickedId);
      setResults(newResults);
      setTotalScore(newScore);
      setLastPoints(points);
      setPhase("answered");

      setTimeout(() => {
        const isLast = currentIndex + 1 >= questions.length;

        if (isLast) {
          try {
            sessionStorage.setItem(
              "gameResults",
              JSON.stringify({ results: newResults, totalScore: newScore, difficulty })
            );
          } catch {
            // sessionStorage が使えない環境は無視
          }
          router.push(
            `/game/result?score=${newScore}&difficulty=${difficulty}&correct=${newResults.filter((r) => r.isCorrect).length}`
          );
        } else {
          setCurrentIndex((prev) => prev + 1);
          setTimeLeft(TIME_LIMIT_SECONDS);
          setSelectedSvgId(null);
          setLastPoints(null);
          setPhase("playing");
          isAnsweringRef.current = false;
        }
      }, ANSWER_DISPLAY_MS);
    },
    [
      currentQuestion,
      difficulty,
      timeLeft,
      results,
      totalScore,
      currentIndex,
      questions.length,
      router,
    ]
  );

  // タイマー
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      recordAnswer(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, recordAnswer]);

  // 地図クリック
  const handleMapClick = useCallback(
    (svgId: string) => {
      if (phase !== "playing") return;
      recordAnswer(svgId);
    },
    [phase, recordAnswer]
  );

  const timerPercent = (timeLeft / TIME_LIMIT_SECONDS) * 100;
  const timerColor =
    timeLeft > 15
      ? "bg-green-400"
      : timeLeft > 8
        ? "bg-yellow-400"
        : "bg-red-500";

  const isCorrect =
    phase === "answered" &&
    selectedSvgId === currentQuestion.prefecture.svg_id;

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50">

      {/* ── 上部ステータスバー ── */}
      <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm border-b border-orange-100 shadow-sm px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <MapPin className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold text-gray-700">
              {currentIndex + 1}
              <span className="text-gray-400 font-normal">/{questions.length}</span>
            </span>
          </div>
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <Clock className="w-4 h-4 text-gray-500 shrink-0" />
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-700 w-7 text-right shrink-0">
              {timeLeft}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-gray-700">
              {totalScore.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── ヒント・フィードバック行 ── */}
      <div className="max-w-6xl mx-auto px-4 pt-4 flex flex-col sm:flex-row items-start justify-center gap-3">
        {/* 難易度 + ヒント：横幅の2/3 */}
        <div className="w-full sm:w-2/3 bg-white rounded-2xl border-2 border-orange-100 p-4 shadow-sm flex items-start gap-3">
          <Badge className="shrink-0 mt-0.5 bg-orange-100 text-orange-700 border-orange-200 rounded-full">
            {diffConfig.label}
          </Badge>
          <div className="min-w-0">
            <p className="text-xs font-bold text-orange-400 tracking-widest uppercase mb-1">
              ヒント
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              {currentQuestion.hint.content}
            </p>
          </div>
        </div>

        {/* 回答フィードバック */}
        {phase === "answered" && (
          <div
            className={`w-full sm:flex-1 rounded-2xl px-5 py-3 border-2 flex items-center gap-3 animate-in fade-in duration-300 ${
              isCorrect
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-red-50 border-red-300 text-red-700"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {isCorrect ? "正解！" : "不正解 / タイムアウト"}
              </p>
              {isCorrect ? (
                <p className="text-xl font-extrabold">
                  +{lastPoints?.toLocaleString()}点
                </p>
              ) : (
                <p className="text-xs font-normal opacity-80">
                  正解：{currentQuestion.prefecture.name}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 地図（中央・縦幅が画面に収まるサイズ） ── */}
      <div className="max-w-6xl mx-auto px-4 pb-4 pt-2">
        <p className="text-center text-xs text-gray-400 mb-1">
          {phase === "playing"
            ? "都道府県をクリックして回答！"
            : "次の問題へ移動中..."}
        </p>
        {/*
          SVGの縦横比は 1000:800 = 5:4
          高さを「100vh - ヘッダー・ステータスバー・ヒント行の合計(約15rem)」に収めるため
          max-width = (100vh - 15rem) × 1.25 で幅を逆算して制約する
        */}
        <div
          className="mx-auto w-full"
          style={{ maxWidth: "min(100%, calc((100vh - 15rem) * 1.25))" }}
        >
          <JapanMap
            onSelect={handleMapClick}
            correctId={
              phase === "answered" ? currentQuestion.prefecture.svg_id : null
            }
            selectedId={selectedSvgId}
            phase={phase}
          />
        </div>
      </div>
    </div>
  );
}
