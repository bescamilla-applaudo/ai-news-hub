import { useEffect } from "react";
import type { Article } from "../types/news";

interface NewsModalProps {
  article: Article;
  onClose: () => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({ article, onClose }) => {
  // Cerrar con la tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-slate-900/90 border border-slate-700/50 max-w-2xl w-full max-h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer clic dentro del modal
      >
        <img
          src={
            article.image ||
            "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop"
          }
          alt={article.title}
          className="w-full h-64 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop";
          }}
        />

        <div className="p-8 overflow-y-auto">
          <div className="text-sm text-blue-400 mb-2 font-mono">
            {new Date(article.publishedAt).toLocaleDateString()}
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-4">
            {article.title}
          </h2>
          <p className="text-slate-300 leading-relaxed mb-8">
            {article.content || article.description}
          </p>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-900/20"
            >
              Read Original
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
