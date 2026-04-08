export const SkeletonCard = () => (
  <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl h-96 overflow-hidden flex flex-col">
    <div className="h-48 bg-slate-800/50 animate-pulse" />
    <div className="p-5 flex-1 flex flex-col gap-4">
      <div className="h-4 bg-slate-800/50 rounded w-1/4 animate-pulse" />
      <div className="h-6 bg-slate-800/50 rounded w-full animate-pulse" />
      <div className="h-6 bg-slate-800/50 rounded w-4/5 animate-pulse" />
      <div className="h-16 bg-slate-800/50 rounded w-full mt-auto animate-pulse" />
    </div>
  </div>
);
