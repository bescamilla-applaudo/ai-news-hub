import { useState } from "react";
import { NewsCard } from "./components/NewsCard";
import { NewsModal } from "./components/NewsModal";
import { SkeletonCard } from "./components/SkeletonCard";
import { useNews } from "./hooks/useNews";
import type { UnifiedArticle } from "./types/schemas";

export default function App() {
  const { news, loading, error } = useNews();
  const [selectedArticle, setSelectedArticle] = useState<UnifiedArticle | null>(
    null,
  );

  const Section = ({
    title,
    articles,
    icon,
  }: {
    title: string;
    articles: UnifiedArticle[];
    icon: string;
  }) => (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-2xl font-bold text-slate-200 tracking-tight">
          {title}
        </h2>
        <span className="ml-auto text-xs font-mono text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
          {articles.length} items
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((art) => (
          <NewsCard key={art.url} article={art} onClick={setSelectedArticle} />
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 p-8 font-sans selection:bg-blue-500/30">
      <header className="max-w-6xl mx-auto mb-16 pt-8 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
          AI Architectures Hub
        </h1>
        <p className="text-slate-400 mt-4 text-lg max-w-2xl">
          Curated technical insights from GNews, Hacker News, Dev.to and Reddit.
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-2xl text-center backdrop-blur-sm">
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          news && (
            <>
              {news.gnews.length > 0 && (
                <Section
                  title="Global AI News"
                  icon="🌐"
                  articles={news.gnews}
                />
              )}
              {news.hackerNews.length > 0 && (
                <Section
                  title="Hacker News Trends"
                  icon="🧡"
                  articles={news.hackerNews}
                />
              )}
              {news.devto.length > 0 && (
                <Section
                  title="Technical Articles"
                  icon="👩‍💻"
                  articles={news.devto}
                />
              )}
              {news.reddit.length > 0 && (
                <Section
                  title="Community Discussions"
                  icon="🤖"
                  articles={news.reddit}
                />
              )}
            </>
          )
        )}
      </main>

      {selectedArticle && (
        <NewsModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
