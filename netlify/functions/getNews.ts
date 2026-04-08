import type { Config } from "@netlify/functions";

export default async () => {
  const API_KEY = process.env.VITE_GNEWS_API_KEY;

  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "API Key not configured in Netlify" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const query = '("DeepSeek" OR "LLM architecture" OR "AI Agents" OR "Anthropic" OR "Google DeepMind" OR "Meta AI" OR "OpenAI")';
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch news from GNews" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: "/api/get-news",
};
