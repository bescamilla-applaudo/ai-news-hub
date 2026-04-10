export interface Article {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url?: string;
  };
}

export interface AINewsResponse {
  articles: Article[];
}
