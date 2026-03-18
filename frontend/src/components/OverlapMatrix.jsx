function overlapTone(overlapPct) {
  if (overlapPct <= 20) return { dot: "bg-emerald-500", text: "text-emerald-400", bar: "bg-emerald-500", label: "Low" };
  if (overlapPct <= 40) return { dot: "bg-amber-500", text: "text-amber-400", bar: "bg-amber-500", label: "Moderate" };
  return { dot: "bg-red-500", text: "text-red-400", bar: "bg-red-500", label: "High" };
}

export default function OverlapMatrix({ overlap }) {
  return (
    <section>
      <h2 className="text-sm font-medium text-white mb-1">
        Funds share <span className="text-white font-semibold">{overlap.averageOverlapPct}%</span> overlap on average
      </h2>
      <p className="text-xs text-[#5c5c63] mb-5">Pairwise stock overlap between selected funds</p>

      <div className="grid sm:grid-cols-2 gap-2">
        {overlap.pairs.map((pair) => {
          const tone = overlapTone(pair.overlapPct);
          return (
            <div key={`${pair.idA}-${pair.idB}`} className="card p-4">
              <div className="text-xs text-[#a0a0a6] mb-3">
                {pair.fundA} <span className="text-[#3a3a40]">vs</span> {pair.fundB}
              </div>
              <div className="flex items-end justify-between">
                <span className={`text-2xl font-semibold ${tone.text}`}>{pair.overlapPct}%</span>
                <span className="flex items-center gap-1.5 text-[11px] text-[#5c5c63]">
                  <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                  {tone.label}
                </span>
              </div>
              <div className="mt-3 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${tone.bar}`}
                  style={{ width: `${pair.overlapPct}%`, animation: "bar-fill 0.6s ease-out" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top shared stocks */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-white mb-3">Top shared stocks</h3>
        {overlap.topSharedStocks.length === 0 ? (
          <p className="text-sm text-[#5c5c63]">No shared stocks found.</p>
        ) : (
          <div className="overflow-x-auto card">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#5c5c63]">Stock</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#5c5c63]">Ticker</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#5c5c63]">Funds</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-[#5c5c63]">Weight</th>
                </tr>
              </thead>
              <tbody>
                {overlap.topSharedStocks.map((stock) => (
                  <tr key={stock.ticker} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 text-[#ececed]">{stock.name}</td>
                    <td className="px-4 py-2.5 text-[#5c5c63] font-mono text-xs">{stock.ticker}</td>
                    <td className="px-4 py-2.5 text-[#a0a0a6] text-xs">{stock.funds.join(", ")}</td>
                    <td className="px-4 py-2.5 text-right text-[#ececed] font-medium">{stock.combinedWeight}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
