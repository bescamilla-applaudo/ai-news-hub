import { z } from "zod";

// Schema for GNews articles
export const GNewsArticleSchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string(),
  image: z.string().optional(),
  publishedAt: z.string(),
  source: z.object({
    name: z.string(),
    url: z.string().optional(),
  }),
});

// Schema for Hacker News (from Algolia)
export const HNStorySchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  objectID: z.string(),
  points: z.number().optional().default(0),
  created_at: z.string(),
});

// Schema for the unified article in the Frontend
export const UnifiedArticleSchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string(),
  image: z.string(),
  publishedAt: z.string(),
  source: z.object({
    name: z.string(),
    url: z.string().optional(),
  }),
  type: z
    .enum(["news", "forum", "tutorial", "article"])
    .optional()
    .default("news"),
});

export interface SectionedNews {
  gnews: UnifiedArticle[];
  hackerNews: UnifiedArticle[];
  devto: UnifiedArticle[];
  reddit: UnifiedArticle[];
}

export type UnifiedArticle = z.infer<typeof UnifiedArticleSchema>;
export type GNewsArticle = z.infer<typeof GNewsArticleSchema>;
export type HNStory = z.infer<typeof HNStorySchema>;
