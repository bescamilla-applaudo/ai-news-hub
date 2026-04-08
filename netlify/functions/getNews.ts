import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const API_KEY = process.env.VITE_GNEWS_API_KEY;
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";

  // 1. SEGURIDAD: Restringir acceso por dominio
  const allowedOrigins = [
    "https://ai-news-applaudo.netlify.app",
    "http://localhost:5173", // Desarrollo local con Vite
    "http://localhost:8888", // Netlify Dev local
  ];

  const isAllowed = allowedOrigins.some((ao) => origin.startsWith(ao));

  if (!isAllowed && process.env.NODE_ENV === "production") {
    return new Response(JSON.stringify({ error: "Unauthorized access" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!API_KEY) {
    return new Response(
      JSON.stringify({ error: "API Key not configured in Netlify" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const query =
    '("DeepSeek" OR "LLM architecture" OR "AI Agents" OR "Anthropic" OR "Google DeepMind" OR "Meta AI" OR "OpenAI")';
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
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
    console.error("Error fetching news:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch news from GNews" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const config: Config = {
  path: "/api/get-news",
};
