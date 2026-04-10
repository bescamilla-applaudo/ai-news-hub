import { type UnifiedArticle } from "../types/schemas";

interface NewsCardProps {
  article: UnifiedArticle;
  onClick: (article: UnifiedArticle) => void;
}

// Imagen por defecto con estilo tech si la API no devuelve una
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop";

export const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => {
  return (
    <article
      onClick={() => onClick(article)}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group flex flex-col h-full shadow-lg"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={article.image || FALLBACK_IMAGE}
          alt={article.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            // Si la imagen de la API falla al cargar, cambiamos al fallback
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
          <span className="text-xs text-blue-300 font-mono uppercase tracking-wider">
            {article.source.name}
          </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h2 className="text-lg font-semibold text-slate-100 line-clamp-2 mb-3 group-hover:text-blue-400 transition-colors">
          {article.title}
        </h2>
        <p className="text-slate-400 text-sm line-clamp-3 flex-1">
          {article.description || "No description available for this article."}
        </p>
      </div>
    </article>
  );
};
