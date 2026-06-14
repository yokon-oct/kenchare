import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kenchare.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/game/play", "/game/result", "/mypage"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
