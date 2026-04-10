import { z } from "zod";
import { UnifiedArticleSchema, type UnifiedArticle } from "../types/schemas";

const CACHE_KEY = "ai_news_cache";
const CACHE_TIME = 60 * 60 * 1000; // 1 hora

// Schema for the overall response from our Netlify Function
const ApiResponseSchema = z.object({
  articles: z.array(UnifiedArticleSchema),
});

export const fetchAINews = async (): Promise<UnifiedArticle[]> => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        return data as UnifiedArticle[];
      }
    } catch (e) {
      console.log(e);
      console.warn("Cache parsing error, fetching fresh data...");
    }
  }

  const response = await fetch("/api/get-news");

  // Error handling mapping
  if (!response.ok) {
    const errorMap: Record<number, string> = {
      403: "403 Forbidden: Verifica la configuración en Netlify.",
      429: "429 Too Many Requests: Límite de GNews superado.",
    };
    throw new Error(
      errorMap[response.status] || `Error inesperado (${response.status})`,
    );
  }

  const rawData = await response.json();
  const parsed = ApiResponseSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error("Data integrity error:", parsed.error);
    throw new Error("Los datos de las noticias no tienen el formato esperado.");
  }

  const articles = parsed.data.articles;

  // Persist valid data to cache
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data: articles,
    }),
  );

  return articles;
};
