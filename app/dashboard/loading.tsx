export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-9 w-48 rounded-lg bg-slate-200 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
            <div className="h-8 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
      <div className="card p-12">
        <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
