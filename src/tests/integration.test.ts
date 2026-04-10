import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../../netlify/functions/getNews";

describe("getNews Integration Test (Mocked)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GNEWS_API_KEY", "test-key");
    vi.stubEnv("NODE_ENV", "development");
    vi.clearAllMocks();
  });

  it("should aggregate news from GNews and Hacker News successfully", async () => {
    // Mock GNews Response
    const mockGNews = {
      articles: [
        {
          title: "AI News",
          description: "Description",
          url: "https://gnews.io",
          publishedAt: "2026-04-09T10:00:00Z",
          source: { name: "GNews Source", url: "https://gnews.io" },
        },
      ],
    };

    // Mock HN Response
    const mockHN = {
      hits: [
        {
          title: "HN Story",
          url: "https://news.ycombinator.com",
          objectID: "1",
          points: 100,
          created_at: "2026-04-09T09:00:00Z",
        },
      ],
    };

    // Mock globals fetch
    const globalFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockGNews,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHN,
      });

    vi.stubGlobal("fetch", globalFetch);

    const request = new Request("http://localhost:8888/api/get-news", {
      headers: { origin: "http://localhost:5173" },
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.articles).toHaveLength(2);
    expect(data.articles[0].source.name).toBe("GNews Source");
    expect(data.articles[1].source.name).toBe("Hacker News");

    // Check sorting (2026-04-09T10:00:00Z should be first)
    expect(data.articles[0].title).toBe("AI News");
  });

  it("should return 403 if origin is not allowed in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const request = new Request("http://localhost:8888/api/get-news", {
      headers: { origin: "http://evil.com" },
    });

    const response = await handler(request);
    expect(response.status).toBe(403);
  });
});
