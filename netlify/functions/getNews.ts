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
    type: "news",
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
    type: "forum",
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

  // --- QUERIES DE DESARROLLO (Filtrado de ruido corporativo) ---
  const techKeywords =
    '"LLM architecture" OR "AI Agents" OR "LangChain" OR "DeepSeek" OR "Vector DB" OR "RAG" OR "PyTorch" OR "HuggingFace" OR "inference" OR "finetuning"';
  const noiseExclusion =
    "NOT (stock OR earnings OR series A OR layoffs OR finance OR crypto OR investment OR market report)";
  const techQuery = encodeURIComponent(`(${techKeywords}) ${noiseExclusion}`);

  try {
    const [gnewsRes, hnRes, devtoRes, redditRes] = await Promise.allSettled([
      fetch(
        `https://gnews.io/api/v4/search?q=${techQuery}&lang=en&max=8&apikey=${API_KEY}`,
      ),
      fetch(
        `https://hn.algolia.com/api/v1/search?query=AI+architecture&tags=story&hitsPerPage=8`,
      ),
      fetch(`https://dev.to/api/articles?tag=ai&per_page=8`),
      fetch(
        `https://www.reddit.com/r/LocalLLaMA+MachineLearning+ArtificialInteligence/top.json?t=day&limit=8`,
        {
          headers: { "User-Agent": "ai-news-hub/1.0" },
        },
      ),
    ]);

    const sections = {
      gnews: [] as UnifiedArticle[],
      hackerNews: [] as UnifiedArticle[],
      devto: [] as UnifiedArticle[],
      reddit: [] as UnifiedArticle[],
    };

    // 1. GNEWS
    if (gnewsRes.status === "fulfilled" && gnewsRes.value.ok) {
      const data = (await gnewsRes.value.json()) as { articles?: unknown[] };
      const rawArticles = z.array(z.unknown()).safeParse(data.articles);
      if (rawArticles.success) {
        rawArticles.data.forEach((a) => {
          const normalized = normalizeGNews(a);
          if (normalized) sections.gnews.push(normalized);
        });
      }
    }

    // 2. HACKER NEWS
    if (hnRes.status === "fulfilled" && hnRes.value.ok) {
      const data = (await hnRes.value.json()) as { hits?: unknown[] };
      const rawHits = z.array(z.unknown()).safeParse(data.hits);
      if (rawHits.success) {
        rawHits.data.forEach((h) => {
          const normalized = normalizeHN(h);
          if (normalized) sections.hackerNews.push(normalized);
        });
      }
    }

    // 3. DEV.TO
    if (devtoRes.status === "fulfilled" && devtoRes.value.ok) {
      const data = (await devtoRes.value.json()) as {
        title: string;
        description?: string;
        url: string;
        social_image?: string;
        cover_image?: string;
        published_at: string;
      }[];
      data?.forEach((post) => {
        sections.devto.push({
          title: post.title,
          description: post.description || "Artículo técnico en Dev.to",
          url: post.url,
          image: post.social_image || post.cover_image || "",
          publishedAt: post.published_at,
          source: { name: "Dev.to" },
          type: "article",
        });
      });
    }

    // 4. REDDIT (JSON API - Sin API Key para lectura pública)
    if (redditRes.status === "fulfilled" && redditRes.value.ok) {
      const data = (await redditRes.value.json()) as {
        data?: {
          children?: {
            data: {
              title: string;
              permalink: string;
              subreddit: string;
              ups: number;
              thumbnail?: string;
              created_utc: number;
            };
          }[];
        };
      };
      data.data?.children?.forEach((child) => {
        const post = child.data;
        sections.reddit.push({
          title: post.title,
          description: `Discusión en r/${post.subreddit}. Upvotes: ${post.ups}`,
          url: `https://reddit.com${post.permalink}`,
          image:
            post.thumbnail &&
            post.thumbnail !== "self" &&
            post.thumbnail !== "default"
              ? post.thumbnail
              : "https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png",
          publishedAt: new Date(post.created_utc * 1000).toISOString(),
          source: { name: `Reddit /r/${post.subreddit}` },
          type: "forum",
        });
      });
    }

    return new Response(JSON.stringify(sections), {
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
