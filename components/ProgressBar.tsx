export default function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="h-2 w-32 rounded-full bg-slate-200 overflow-hidden">
      <div
        className="h-full rounded-full bg-brand-500 transition-all duration-300"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
