import { describe, expect, it } from "vitest";
import { GNewsArticleSchema, HNStorySchema } from "../types/schemas";

describe("Validation Schemas (Zod)", () => {
  it("should validate a correct GNews article", () => {
    const validArticle = {
      title: "New AI Architecture",
      description: "Research on RAG systems",
      url: "https://example.com",
      image: "https://example.com/img.png",
      publishedAt: "2026-04-09T12:00:00Z",
      source: { name: "TechCrunch" },
    };
    const result = GNewsArticleSchema.safeParse(validArticle);
    expect(result.success).toBe(true);
  });

  it("should fail for an invalid GNews article", () => {
    const invalidArticle = {
      title: "Incomplete",
      // missing description
      url: "https://example.com",
    };
    const result = GNewsArticleSchema.safeParse(invalidArticle);
    expect(result.success).toBe(false);
  });

  it("should validate a Hacker News hit", () => {
    const validHN = {
      title: "Agentic Workflows are the future",
      url: "https://news.ycombinator.com",
      objectID: "12345",
      points: 42,
      created_at: "2026-04-09T10:00:00Z",
    };
    const result = HNStorySchema.safeParse(validHN);
    expect(result.success).toBe(true);
  });

  it("should default points to 0 if missing in HN", () => {
    const missingPoints = {
      title: "Untitled",
      objectID: "1",
      created_at: "2026-01-01",
    };
    const result = HNStorySchema.parse(missingPoints);
    expect(result.points).toBe(0);
  });
});
