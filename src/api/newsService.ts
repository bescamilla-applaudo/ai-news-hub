import { z } from "zod";
import { UnifiedArticleSchema, type SectionedNews } from "../types/schemas";

const CACHE_KEY = "ai_news_cache_v2"; // Incremento versión por cambio de estructura
const CACHE_TIME = 60 * 60 * 1000; // 1 hora

const ApiResponseSchema = z.object({
  gnews: z.array(UnifiedArticleSchema),
  hackerNews: z.array(UnifiedArticleSchema),
  devto: z.array(UnifiedArticleSchema),
  reddit: z.array(UnifiedArticleSchema),
});

export const fetchAINews = async (): Promise<SectionedNews> => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        return data as SectionedNews;
      }
    } catch (e) {
      console.warn("Cache parsing error, fetching fresh data...");
    }
  }

  const response = await fetch("/api/get-news");
  if (!response.ok) {
    throw new Error(`Error en la petición: ${response.status}`);
  }

  const rawData = await response.json();
  const parsed = ApiResponseSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error("Data integrity error:", parsed.error);
    throw new Error("Los datos de las noticias no tienen el formato esperado.");
  }

  const sections = parsed.data;

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data: sections,
    }),
  );

  return sections;
};
