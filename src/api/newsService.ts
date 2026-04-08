import type { Article, GNewsResponse } from "../types/news";

const CACHE_KEY = "ai_news_cache";
const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 horas

export const fetchAINews = async (): Promise<Article[]> => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TIME) {
      return data; // Retorna caché si no han pasado 24h
    }
  }

  const response = await fetch("/api/get-news");

  // Manejo de Errores Específicos
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("403 Forbidden: Verifica la configuración en Netlify.");
    }
    if (response.status === 429) {
      throw new Error("429 Too Many Requests: Límite de GNews superado.");
    }
    throw new Error(
      `Error inesperado al conectar con la función de Netlify (${response.status})`,
    );
  }

  const data: GNewsResponse = await response.json();

  // Solo guardamos en caché si la respuesta tiene artículos válidos
  if (data && data.articles) {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: data.articles,
      }),
    );
    return data.articles;
  }

  return [];
};
