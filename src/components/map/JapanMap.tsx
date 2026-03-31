"use client";

import { useState } from "react";

// SVG viewBox (CSSの height=80%of width に対応: 1000×800)
const VW = 1000;
const VH = 800;

// CSSの % をSVG座標に変換
const px = (pct: number) => (pct / 100) * VW;
const py = (pct: number) => (pct / 100) * VH;
const pw = (pct: number) => (pct / 100) * VW;
const ph = (pct: number) => (pct / 100) * VH;

// 地方別カラー（web.contempo.jp の CSS に準拠）
const REGION_BG: Record<string, string> = {
  北海道: "#759ef4",
  東北:   "#759ef4",
  関東:   "#7ecfea",
  中部:   "#7cdc92",
  近畿:   "#ffe966",
  中国:   "#ffcc66",
  四国:   "#ffbb9c",
  九州:   "#ffbdbd",
  沖縄:   "#ffbdbd",
};

const TEXT_COLOR   = "#3a3835";
const TEXT_ACTIVE  = "#ffffff";
const CORRECT_BG   = "#16a34a";
const WRONG_BG     = "#dc2626";

interface PrefTile {
  id: string;
  name: string;
  region: string;
  left: number;   // % (CSS left)
  top: number;    // % (CSS top)
  width: number;  // % (CSS width)
  height: number; // % (CSS height)
}

const D_W = 7;   // デフォルト幅 (%)
const D_H = 12;  // デフォルト高さ (%)

// CSS の top/left/width/height をそのまま転記
const TILES: PrefTile[] = [
  { id: "pref-01", name: "北海道",   region: "北海道", left: 81,   top: 0,    width: 21,   height: 20 },
  { id: "pref-02", name: "青森県",   region: "東北",   left: 79,   top: 21,   width: 19,   height: 8  },
  { id: "pref-05", name: "秋田県",   region: "東北",   left: 79,   top: 29,   width: 10.5, height: 8  },
  { id: "pref-03", name: "岩手県",   region: "東北",   left: 89.5, top: 29,   width: 10.5, height: 8  },
  { id: "pref-06", name: "山形県",   region: "東北",   left: 79,   top: 37,   width: 10.5, height: 8  },
  { id: "pref-04", name: "宮城県",   region: "東北",   left: 89.5, top: 37,   width: 10.5, height: 8  },
  { id: "pref-07", name: "福島県",   region: "東北",   left: 93,   top: 45,   width: D_W,  height: 18 },
  { id: "pref-08", name: "茨城県",   region: "関東",   left: 93,   top: 63,   width: D_W,  height: 18 },
  { id: "pref-09", name: "栃木県",   region: "関東",   left: 86,   top: 57,   width: D_W,  height: D_H },
  { id: "pref-10", name: "群馬県",   region: "関東",   left: 79,   top: 57,   width: D_W,  height: D_H },
  { id: "pref-11", name: "埼玉県",   region: "関東",   left: 86,   top: 69,   width: D_W,  height: D_H },
  { id: "pref-12", name: "千葉県",   region: "関東",   left: 93,   top: 81,   width: D_W,  height: 17 },
  { id: "pref-13", name: "東京都",   region: "関東",   left: 86,   top: 81,   width: D_W,  height: D_H },
  { id: "pref-14", name: "神奈川県", region: "関東",   left: 79,   top: 81,   width: D_W,  height: D_H },
  { id: "pref-15", name: "新潟県",   region: "中部",   left: 79,   top: 45,   width: 14,   height: D_H },
  { id: "pref-16", name: "富山県",   region: "中部",   left: 72,   top: 45,   width: D_W,  height: D_H },
  { id: "pref-17", name: "石川県",   region: "中部",   left: 65,   top: 45,   width: D_W,  height: 17 },
  { id: "pref-18", name: "福井県",   region: "中部",   left: 58,   top: 50,   width: D_W,  height: D_H },
  { id: "pref-19", name: "山梨県",   region: "中部",   left: 79,   top: 69,   width: D_W,  height: D_H },
  { id: "pref-20", name: "長野県",   region: "中部",   left: 72,   top: 57,   width: D_W,  height: 24 },
  { id: "pref-21", name: "岐阜県",   region: "中部",   left: 65,   top: 62,   width: D_W,  height: 19 },
  { id: "pref-22", name: "静岡県",   region: "中部",   left: 72,   top: 81,   width: D_W,  height: D_H },
  { id: "pref-23", name: "愛知県",   region: "中部",   left: 65,   top: 81,   width: D_W,  height: D_H },
  { id: "pref-24", name: "三重県",   region: "近畿",   left: 58,   top: 86,   width: D_W,  height: D_H },
  { id: "pref-25", name: "滋賀県",   region: "近畿",   left: 58,   top: 62,   width: D_W,  height: D_H },
  { id: "pref-26", name: "京都府",   region: "近畿",   left: 51,   top: 56,   width: D_W,  height: 18 },
  { id: "pref-27", name: "大阪府",   region: "近畿",   left: 51,   top: 74,   width: D_W,  height: D_H },
  { id: "pref-28", name: "兵庫県",   region: "近畿",   left: 44,   top: 53,   width: D_W,  height: 24 },
  { id: "pref-29", name: "奈良県",   region: "近畿",   left: 58,   top: 74,   width: D_W,  height: D_H },
  { id: "pref-30", name: "和歌山県", region: "近畿",   left: 51,   top: 86,   width: D_W,  height: D_H },
  { id: "pref-31", name: "鳥取県",   region: "中国",   left: 37,   top: 53,   width: D_W,  height: D_H },
  { id: "pref-32", name: "島根県",   region: "中国",   left: 30,   top: 53,   width: D_W,  height: D_H },
  { id: "pref-33", name: "岡山県",   region: "中国",   left: 37,   top: 65,   width: D_W,  height: D_H },
  { id: "pref-34", name: "広島県",   region: "中国",   left: 30,   top: 65,   width: D_W,  height: D_H },
  { id: "pref-35", name: "山口県",   region: "中国",   left: 23,   top: 59,   width: D_W,  height: D_H },
  { id: "pref-37", name: "香川県",   region: "四国",   left: 36.5, top: 81.5, width: 10.5, height: 8  },
  { id: "pref-38", name: "愛媛県",   region: "四国",   left: 26,   top: 81.5, width: 10.5, height: 8  },
  { id: "pref-36", name: "徳島県",   region: "四国",   left: 36.5, top: 89.5, width: 10.5, height: 8  },
  { id: "pref-39", name: "高知県",   region: "四国",   left: 26,   top: 89.5, width: 10.5, height: 8  },
  { id: "pref-40", name: "福岡県",   region: "九州",   left: 15,   top: 55,   width: D_W,  height: D_H },
  { id: "pref-41", name: "佐賀県",   region: "九州",   left: 8,    top: 55,   width: D_W,  height: D_H },
  { id: "pref-42", name: "長崎県",   region: "九州",   left: 1,    top: 55,   width: D_W,  height: 16 },
  { id: "pref-44", name: "大分県",   region: "九州",   left: 15,   top: 67,   width: D_W,  height: D_H },
  { id: "pref-43", name: "熊本県",   region: "九州",   left: 8,    top: 67,   width: D_W,  height: D_H },
  { id: "pref-45", name: "宮崎県",   region: "九州",   left: 15,   top: 79,   width: D_W,  height: D_H },
  { id: "pref-46", name: "鹿児島県", region: "九州",   left: 8,    top: 79,   width: D_W,  height: D_H },
  { id: "pref-47", name: "沖縄県",   region: "沖縄",   left: 0,    top: 88,   width: D_W,  height: D_H },
];

function getDisplayName(name: string): string {
  if (
    name.endsWith("都") ||
    name.endsWith("府") ||
    name.endsWith("県")
  ) {
    return name.slice(0, -1);
  }
  return name;
}

export interface JapanMapProps {
  onSelect: (svgId: string) => void;
  correctId?: string | null;
  selectedId?: string | null;
  phase: "playing" | "answered";
  /** モバイルパネル表示時に SVG の viewBox を上書きする */
  viewBox?: string;
  /**
   * SVG 要素に追加する className。
   * モバイル固定高コンテナ内では "h-full w-full" を渡すことで
   * コンテナいっぱいに描画できる。省略時は "w-full"（幅100%・高さ自動）。
   */
  svgClassName?: string;
  /**
   * 表示するタイルの ID 集合。指定した場合、この ID に含まれるタイルのみ描画し
   * 他地域のタイルを完全に非表示にする。省略時は全 47 都道府県を表示。
   */
  visibleIds?: readonly string[];
}

export function JapanMap({
  onSelect,
  correctId,
  selectedId,
  phase,
  viewBox: viewBoxOverride,
  svgClassName,
  visibleIds,
}: JapanMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function getTileStyle(tile: PrefTile) {
    const bg = REGION_BG[tile.region] ?? "#cccccc";

    if (phase === "answered") {
      if (tile.id === correctId)
        return { bg: CORRECT_BG, text: TEXT_ACTIVE, opacity: 1, bold: true };
      if (tile.id === selectedId)
        return { bg: WRONG_BG, text: TEXT_ACTIVE, opacity: 1, bold: true };
      return { bg, text: TEXT_COLOR, opacity: 1, bold: false };
    }

    return {
      bg,
      text: TEXT_COLOR,
      opacity: hoveredId === tile.id ? 0.8 : 1,
      bold: false,
    };
  }

  const viewBox = viewBoxOverride ?? `0 0 ${VW} ${VH}`;

  // visibleIds が指定されている場合はその地域のタイルのみ描画
  const visibleSet = visibleIds ? new Set(visibleIds) : null;
  const tiles = visibleSet ? TILES.filter((t) => visibleSet.has(t.id)) : TILES;

  return (
    <svg
      viewBox={viewBox}
      className={svgClassName ?? "w-full"}
      preserveAspectRatio="xMidYMid meet"
      aria-label="日本地図"
      style={{ userSelect: "none" }}
    >
      {tiles.map((tile) => {
        const x = px(tile.left);
        const y = py(tile.top);
        const w = pw(tile.width);
        const h = ph(tile.height);
        const style = getTileStyle(tile);
        const displayName = getDisplayName(tile.name);
        const isActive =
          phase === "answered" &&
          (tile.id === correctId || tile.id === selectedId);

        // タイルの幅・高さに合わせてフォントサイズを決定
        const charCount = displayName.length;
        const fontByWidth = w / (charCount * 0.75);
        const fontByHeight = h * 0.28;
        const fontSize = Math.min(fontByWidth, fontByHeight, 22);

        return (
          <g
            key={tile.id}
            onClick={() => phase === "playing" && onSelect(tile.id)}
            onMouseEnter={() => setHoveredId(tile.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              cursor: phase === "playing" ? "pointer" : "default",
              opacity: style.opacity,
              transition: "opacity 0.1s",
            }}
            role="button"
            aria-label={tile.name}
          >
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={style.bg}
              stroke="white"
              strokeWidth={3}
              style={{
                transition: "fill 0.15s",
                filter: isActive
                  ? "drop-shadow(0 2px 6px rgba(0,0,0,0.3))"
                  : undefined,
              }}
            />
            {/* paintOrder で白縁取り文字 (CSS text-shadow 相当) */}
            <text
              x={x + w / 2}
              y={y + h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              fontWeight={style.bold ? "bold" : "normal"}
              fill={style.text}
              stroke="white"
              strokeWidth={fontSize * 0.35}
              paintOrder="stroke"
              style={{ pointerEvents: "none" }}
            >
              {displayName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
