import type { Article, GNewsResponse } from "../types/news";

const API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
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

  const query =
    '("DeepSeek" OR "LLM architecture" OR "AI Agents" OR "Anthropic" OR "Google DeepMind" OR "Meta AI" OR "OpenAI")';
  const targetUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${API_KEY}`;
  const proxyUrl = `https://cors-anywhere.herokuapp.com/${targetUrl}`;

  const response = await fetch(proxyUrl, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  // Manejo de Errores Específicos de GNews
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("403 Forbidden: Verifica que tu API Key sea válida.");
    }
    if (response.status === 429) {
      throw new Error(
        "429 Too Many Requests: Has superado el límite gratuito de 100 peticiones diarias en GNews.",
      );
    }
    throw new Error(
      `Error inesperado al conectar con la API (${response.status})`,
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
