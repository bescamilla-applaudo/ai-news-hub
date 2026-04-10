import type { Config } from "@netlify/functions";
import { z } from "zod";
import {
  GNewsArticleSchema,
  HNStorySchema,
  type UnifiedArticle,
} from "../../src/types/schemas";

// --- MIDDLEWARE DE SEGURIDAD ---
const checkAllowedOrigin = (
  req: Request,
): { isAllowed: boolean; origin: string } => {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  const allowedOrigins = [
    "https://ai-news-applaudo.netlify.app",
    "http://localhost:5173",
    "http://localhost:8888",
  ];
  const isAllowed = allowedOrigins.some((ao) => origin.startsWith(ao));
  return { isAllowed, origin };
};

// --- NORMALIZADORES (Domain logic) ---
const normalizeGNews = (article: unknown): UnifiedArticle | null => {
  const result = GNewsArticleSchema.safeParse(article);
  if (!result.success) return null;
  const art = result.data;
  return {
    title: art.title,
    description: art.description,
    url: art.url,
    image: art.image || "",
    publishedAt: art.publishedAt,
    source: { name: art.source.name },
  };
};

const normalizeHN = (hit: unknown): UnifiedArticle | null => {
  const result = HNStorySchema.safeParse(hit);
  if (!result.success) return null;
  const story = result.data;
  return {
    title: story.title,
    description: `Discusión técnica en Hacker News. Puntuación: ${story.points}`,
    url: story.url || `https://news.ycombinator.com/item?id=${story.objectID}`,
    image: "https://news.ycombinator.com/favicon.ico",
    publishedAt: story.created_at,
    source: { name: "Hacker News" },
  };
};

export default async (req: Request) => {
  const API_KEY = process.env.VITE_GNEWS_API_KEY;
  const { isAllowed, origin } = checkAllowedOrigin(req);

  if (!isAllowed && process.env.NODE_ENV === "production") {
    return new Response(JSON.stringify({ error: "Unauthorized access" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const techQuery = encodeURIComponent(
    '("LLM architecture" OR "AI Agents" OR "LangChain" OR "DeepSeek" OR "Vector Databases" OR "RAG systems") NOT (stock OR finance OR crypto)',
  );

  try {
    const [gnewsRes, hnRes] = await Promise.allSettled([
      fetch(
        `https://gnews.io/api/v4/search?q=${techQuery}&lang=en&max=10&apikey=${API_KEY}`,
      ),
      fetch(
        `https://hn.algolia.com/api/v1/search?query=AI+architecture&tags=story&hitsPerPage=10`,
      ),
    ]);

    const articles: UnifiedArticle[] = [];

    if (gnewsRes.status === "fulfilled" && gnewsRes.value.ok) {
      const data = await gnewsRes.value.json();
      const rawArticles = z.array(z.unknown()).safeParse(data.articles);
      if (rawArticles.success) {
        rawArticles.data.forEach((a) => {
          const normalized = normalizeGNews(a);
          if (normalized) articles.push(normalized);
        });
      }
    }

    if (hnRes.status === "fulfilled" && hnRes.value.ok) {
      const data = await hnRes.value.json();
      const rawHits = z.array(z.unknown()).safeParse(data.hits);
      if (rawHits.success) {
        rawHits.data.forEach((h) => {
          const normalized = normalizeHN(h);
          if (normalized) articles.push(normalized);
        });
      }
    }

    // Sort by freshness
    articles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    return new Response(JSON.stringify({ articles }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": isAllowed
          ? origin.endsWith("/")
            ? origin.slice(0, -1)
            : origin
          : "https://ai-news-applaudo.netlify.app",
      },
    });
  } catch (error) {
    console.error("Backend Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = { path: "/api/get-news" };
