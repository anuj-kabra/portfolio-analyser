const CARDS = [
  { key: "concentrated", label: "Concentrated" },
  { key: "redundant", label: "Redundant" },
  { key: "recommendation", label: "Recommendation" },
];

export default function AIInsights({ insights, loading, error }) {
  if (loading) {
    return (
      <section className="card p-6 text-center">
        <div className="inline-flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
          <p className="text-sm text-[#5c5c63]">Generating AI insights…</p>
        </div>
        <div className="mt-5 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg animate-shimmer" />
          ))}
        </div>
      </section>
    );
  }

  if (error || !insights) {
    return (
      <section className="card p-5 text-sm text-[#5c5c63]">
        AI insights are unavailable right now. The analysis above is still valid.
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-medium text-white">AI insights</h2>
        <span className="text-[10px] text-[#5c5c63] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
          Gemini
        </span>
      </div>

      <div className="space-y-2">
        {CARDS.map((card) => (
          <div key={card.key} className="card p-4">
            <h3 className="text-xs font-medium text-[#5c5c63] uppercase tracking-wide mb-1">{card.label}</h3>
            <p className="text-sm text-[#a0a0a6] leading-relaxed">{insights[card.key]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
