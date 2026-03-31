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

// ── モバイル用地方パネル（7分割）────────────────────────────────
// viewBox: "minX minY width height"（SVG座標系 1000×800 基準）
// タイル座標（left/top/width/height %）から厳密計算、padding=20px
// ids: そのパネルで表示する都道府県 ID（他地域は非表示）
const MOBILE_PANELS = [
  {
    label: "北海道・東北", emoji: "🐻",
    // 北海道 x:[810,1020] y:[0,160]  東北 x:[790,1000] y:[168,504]
    viewBox: "770 -20 270 544",
    ids: ["pref-01","pref-02","pref-03","pref-04","pref-05","pref-06","pref-07"],
  },
  {
    label: "関東", emoji: "🗼",
    // x:[790,1000] y:[456,784]
    viewBox: "770 436 250 368",
    ids: ["pref-08","pref-09","pref-10","pref-11","pref-12","pref-13","pref-14"],
  },
  {
    label: "中部", emoji: "🏔️",
    // x:[580,930] y:[360,744]
    viewBox: "560 340 390 424",
    ids: ["pref-15","pref-16","pref-17","pref-18","pref-19","pref-20","pref-21","pref-22","pref-23"],
  },
  {
    label: "近畿", emoji: "⛩️",
    // x:[440,650] y:[424,784]
    viewBox: "420 404 250 400",
    ids: ["pref-24","pref-25","pref-26","pref-27","pref-28","pref-29","pref-30"],
  },
  {
    label: "中国", emoji: "🌊",
    // x:[230,440] y:[424,616]
    viewBox: "210 404 250 232",
    ids: ["pref-31","pref-32","pref-33","pref-34","pref-35"],
  },
  {
    label: "四国", emoji: "🍊",
    // x:[260,470] y:[652,780]
    viewBox: "240 632 250 168",
    ids: ["pref-36","pref-37","pref-38","pref-39"],
  },
  {
    label: "九州・沖縄", emoji: "🌺",
    // x:[0,220] y:[440,800]
    viewBox: "-20 420 260 400",
    ids: ["pref-40","pref-41","pref-42","pref-43","pref-44","pref-45","pref-46","pref-47"],
  },
] as const;

// 各都道府県がどのモバイルパネルに属するか（7分割対応）
const PREF_PANEL: Record<string, number> = {
  // 0: 北海道・東北
  "pref-01": 0,
  "pref-02": 0, "pref-03": 0, "pref-04": 0,
  "pref-05": 0, "pref-06": 0, "pref-07": 0,
  // 1: 関東
  "pref-08": 1, "pref-09": 1, "pref-10": 1, "pref-11": 1,
  "pref-12": 1, "pref-13": 1, "pref-14": 1,
  // 2: 中部
  "pref-15": 2, "pref-16": 2, "pref-17": 2, "pref-18": 2,
  "pref-19": 2, "pref-20": 2, "pref-21": 2, "pref-22": 2, "pref-23": 2,
  // 3: 近畿
  "pref-24": 3, "pref-25": 3, "pref-26": 3, "pref-27": 3,
  "pref-28": 3, "pref-29": 3, "pref-30": 3,
  // 4: 中国
  "pref-31": 4, "pref-32": 4, "pref-33": 4, "pref-34": 4, "pref-35": 4,
  // 5: 四国
  "pref-36": 5, "pref-37": 5, "pref-38": 5, "pref-39": 5,
  // 6: 九州・沖縄
  "pref-40": 6, "pref-41": 6, "pref-42": 6, "pref-43": 6,
  "pref-44": 6, "pref-45": 6, "pref-46": 6, "pref-47": 6,
};

interface GameClientProps {
  questions: GameQuestion[];
  difficulty: Difficulty;
}

export function GameClient({ questions, difficulty }: GameClientProps) {
  const router = useRouter();
  const isAnsweringRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const [phase, setPhase] = useState<"playing" | "answered">("playing");
  const [selectedSvgId, setSelectedSvgId] = useState<string | null>(null);
  const [results, setResults] = useState<GameResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const [activePanel, setActivePanel] = useState(0);

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

  // スクロール位置からアクティブパネルを計算
  const handlePanelScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const newPanel = Math.round(scrollLeft / clientWidth);
    setActivePanel(newPanel);
  }, []);

  // 指定パネルへスムーズスクロール
  const scrollToPanel = useCallback((index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * scrollRef.current.clientWidth,
      behavior: "smooth",
    });
    setActivePanel(index);
  }, []);

  // 回答後、正解の都道府県が属するパネルへ自動ジャンプ（モバイルUX向上）
  useEffect(() => {
    if (phase === "answered" && currentQuestion) {
      const panel = PREF_PANEL[currentQuestion.prefecture.svg_id];
      if (panel !== undefined) {
        setActivePanel(panel);
        scrollToPanel(panel);
      }
    }
  // scrollToPanel は useCallback で安定しているため依存配列に含める
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQuestion]);

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

      {/* ── 地図エリア ── */}
      <div className="max-w-6xl mx-auto px-4 pb-4 pt-2">
        <p className="text-center text-xs text-gray-400 mb-2">
          {phase === "playing"
            ? "都道府県をタップして回答！"
            : "次の問題へ移動中..."}
        </p>

        {/* ── モバイル：6パネル横スクロールカルーセル ── */}
        <div className="block sm:hidden">
          {/* 現在のパネル名 */}
          <p className="text-center text-xs font-bold text-gray-600 mb-1">
            {MOBILE_PANELS[activePanel].emoji} {MOBILE_PANELS[activePanel].label}
            {phase === "answered" &&
              PREF_PANEL[currentQuestion.prefecture.svg_id] !== activePanel && (
                <span className="ml-2 text-green-600 animate-pulse">
                  ← スワイプして正解を確認
                </span>
              )}
          </p>

          {/* 横スクロールパネルコンテナ（スナップ付き） */}
          <div
            ref={scrollRef}
            onScroll={handlePanelScroll}
            className="flex overflow-x-auto snap-x snap-mandatory rounded-2xl"
            style={{
              height: "58vh",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            } as React.CSSProperties}
          >
            {MOBILE_PANELS.map((panel, i) => (
              <div
                key={i}
                className="flex-none w-full h-full snap-start flex items-center justify-center bg-orange-50/30"
              >
                <JapanMap
                  onSelect={handleMapClick}
                  correctId={
                    phase === "answered"
                      ? currentQuestion.prefecture.svg_id
                      : null
                  }
                  selectedId={selectedSvgId}
                  phase={phase}
                  viewBox={panel.viewBox}
                  svgClassName="h-full w-full"
                  visibleIds={panel.ids}
                />
              </div>
            ))}
          </div>

          {/* ドットインジケーター（タップでパネルジャンプ） */}
          <div className="flex justify-center items-center gap-2 pt-2">
            {MOBILE_PANELS.map((panel, i) => {
              const isActive = activePanel === i;
              const isCorrectPanel =
                phase === "answered" &&
                PREF_PANEL[currentQuestion.prefecture.svg_id] === i;
              return (
                <button
                  key={i}
                  onClick={() => scrollToPanel(i)}
                  aria-label={panel.label}
                  className={[
                    "transition-all rounded-full",
                    isActive
                      ? "w-5 h-2 bg-orange-400"
                      : isCorrectPanel
                      ? "w-2 h-2 bg-green-400 animate-pulse"
                      : "w-2 h-2 bg-gray-300",
                  ].join(" ")}
                />
              );
            })}
          </div>
        </div>

        {/* ── デスクトップ：全体地図（縦幅が画面に収まるサイズ） ── */}
        <div
          className="hidden sm:block mx-auto w-full"
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
