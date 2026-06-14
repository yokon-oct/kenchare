import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kenchare.vercel.app";

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "けんちゃれ！ | 都道府県当てゲーム",
    template: "%s | けんちゃれ！",
  },
  description:
    "ヒントを読んで日本地図の都道府県を当てるクイズゲーム。かんたん・ふつう・むずかしいの3段階。全10問・毎回ランダム出題で何度でも遊べる！地理の勉強にも最適。無料でプレイできます。",
  keywords: [
    "都道府県",
    "日本地図",
    "クイズ",
    "ゲーム",
    "地理",
    "勉強",
    "無料",
    "けんちゃれ",
    "都道府県当て",
    "47都道府県",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "けんちゃれ！",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/icons/favicon-32.png"],
  },
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "けんちゃれ！ | 都道府県当てゲーム",
    description:
      "ヒントを読んで日本地図の都道府県を当てよう！無料で遊べる地理クイズゲーム。全10問・3段階の難易度。",
    url: siteUrl,
    siteName: "けんちゃれ！",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "けんちゃれ！都道府県当てゲーム",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "けんちゃれ！ | 都道府県当てゲーム",
    description:
      "ヒントを読んで都道府県を当てよう！無料地理クイズゲーム。全10問・3段階の難易度。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-BMWDRFXK8X"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-BMWDRFXK8X');
        `}
      </Script>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
