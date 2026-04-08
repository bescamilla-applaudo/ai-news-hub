import { useEffect, useState } from "react";
import { fetchAINews } from "../api/newsService";
import type { Article } from "../types/news";

export const useNews = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAINews();
        setArticles(data);
      } catch (err) {
        // Manejo básico de errores (se puede expandir para leer códigos HTTP)
        setError(
          "No se pudieron cargar las noticias. Verifica tu API Key o el límite de peticiones (Error 403/429)." +
            err,
        );
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  return { articles, loading, error };
};
