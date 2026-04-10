import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../../netlify/functions/getNews";

describe("getNews Integration Test (Mocked)", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GNEWS_API_KEY", "test-key");
    vi.stubEnv("NODE_ENV", "development");
    vi.clearAllMocks();
  });

  it("should return sectioned news results from all sources", async () => {
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

    // Mock Dev.to Response
    const mockDevTo = [
      {
        title: "DevTo Post",
        description: "Dev.to Description",
        url: "https://dev.to/post",
        social_image: "https://dev.to/img.png",
        published_at: "2026-04-09T11:00:00Z",
      },
    ];

    // Mock Reddit Response
    const mockReddit = {
      data: {
        children: [
          {
            data: {
              title: "Reddit Post",
              permalink: "/r/test",
              ups: 50,
              created_utc: 1712620800,
              subreddit: "LocalLLaMA",
            },
          },
        ],
      },
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
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockDevTo,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockReddit,
      });

    vi.stubGlobal("fetch", globalFetch);

    const request = new Request("http://localhost:8888/api/get-news", {
      headers: { origin: "http://localhost:5173" },
    });

    const response = await handler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.gnews).toHaveLength(1);
    expect(data.hackerNews).toHaveLength(1);
    expect(data.devto).toHaveLength(1);
    expect(data.reddit).toHaveLength(1);
    expect(data.gnews[0].title).toBe("AI News");
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
