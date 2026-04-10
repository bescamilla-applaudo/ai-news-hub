import { useEffect, useState } from "react";
import { fetchAINews } from "../api/newsService";
import type { SectionedNews } from "../types/schemas";

export const useNews = () => {
  const [news, setNews] = useState<SectionedNews | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const data = await fetchAINews();
        setNews(data);
      } catch (err) {
        setError("Error al cargar secciones.");
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  return { news, loading, error };
};
