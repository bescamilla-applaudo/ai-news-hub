import { useState } from "react";
import { NewsCard } from "./components/NewsCard";
import { NewsModal } from "./components/NewsModal";
import { SkeletonCard } from "./components/SkeletonCard";
import { useNews } from "./hooks/useNews";
import type { Article } from "./types/news";

export default function App() {
  const { articles, loading, error } = useNews();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 p-8 font-sans selection:bg-blue-500/30">
      <header className="max-w-6xl mx-auto mb-16 pt-8 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
          AI Architectures 2026
        </h1>
        <p className="text-slate-400 mt-4 text-lg max-w-2xl">
          Real-time insights on Neural Networks, AI Agents, and LLM advancements
          from industry leaders.
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Manejo de Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-2xl text-center backdrop-blur-sm">
            <p className="text-lg font-medium">{error}</p>
          </div>
        )}

        {/* Grid de Contenido / Carga */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? [...Array(9)].map((_, i) => <SkeletonCard key={i} />)
            : articles.map((art) => (
                <NewsCard
                  key={art.url}
                  article={art}
                  onClick={setSelectedArticle}
                />
              ))}
        </div>
      </main>

      {/* Renderizado Condicional del Modal */}
      {selectedArticle && (
        <NewsModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
