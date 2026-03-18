function overlapTone(overlapPct) {
  if (overlapPct <= 20) return { dot: "bg-emerald-500", text: "text-emerald-400", bar: "bg-emerald-500", label: "Low" };
  if (overlapPct <= 40) return { dot: "bg-amber-500", text: "text-amber-400", bar: "bg-amber-500", label: "Moderate" };
  return { dot: "bg-red-500", text: "text-red-400", bar: "bg-red-500", label: "High" };
}

const INR = new Intl.NumberFormat("en-IN");

function shortName(name) {
  return String(name || "").split(" Fund")[0];
}

export default function OverlapMatrix({ overlap, totalInvested = 0, ghost }) {
  const redundantStocks = ghost?.redundantStocks ?? 0;
  const sharedAmount = overlap.topSharedStocks.reduce(
    (sum, s) => sum + Math.round((totalInvested * s.combinedWeight) / 100),
    0
  );

  return (
    <section>
      <h2 className="text-sm font-medium text-white mb-1">
        Funds share <span className="text-white font-semibold">{overlap.averageOverlapPct}%</span> overlap on average
      </h2>
      <p className="text-xs text-[#5c5c63] mb-3">Pairwise stock overlap between selected funds</p>

      {redundantStocks > 0 && (
        <div className="card p-4 mb-5 border-amber-500/20 bg-amber-500/[0.04] text-sm text-[#a0a0a6]">
          {redundantStocks} shared stocks across your funds represent INR {INR.format(sharedAmount)} — you&apos;re
          paying multiple fund managers for the same positions.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-2">
        {overlap.pairs.map((pair) => {
          const tone = overlapTone(pair.overlapPct);
          const topShared = pair.sharedStocks?.[0];
          return (
            <div key={`${pair.idA}-${pair.idB}`} className="card p-4">
              <div className="text-xs text-[#a0a0a6] mb-3">
                {shortName(pair.fundA)} <span className="text-[#a0a0a6]">vs</span> {shortName(pair.fundB)}
              </div>
              <div className="flex items-end justify-between">
                <span className={`text-2xl font-semibold ${tone.text}`}>{pair.overlapPct}%</span>
                <span className="flex items-center gap-1.5 text-[11px] text-[#5c5c63]">
                  <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                  {tone.label}
                </span>
              </div>
              {pair.overlapPct > 20 && topShared && (
                <div className="text-[11px] text-[#5c5c63] mt-1">
                  Top shared: {topShared.name} ({topShared.combinedWeight}%)
                </div>
              )}
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
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-[#5c5c63]">Approx Amount</th>
                </tr>
              </thead>
              <tbody>
                {overlap.topSharedStocks.map((stock) => (
                  <tr key={stock.ticker} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 text-[#ececed]">{stock.name}</td>
                    <td className="px-4 py-2.5 text-[#5c5c63] font-mono text-xs">{stock.ticker}</td>
                    <td className="px-4 py-2.5 text-[#a0a0a6] text-xs">{stock.funds.join(", ")}</td>
                    <td className="px-4 py-2.5 text-right text-[#ececed] font-medium">{stock.combinedWeight}%</td>
                    <td className="px-4 py-2.5 text-right text-[#ececed]">
                      INR {INR.format(Math.round((totalInvested * stock.combinedWeight) / 100))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {overlap.averageOverlapPct > 20 && (
        <div className="mt-6 card p-4 border-amber-500/20 bg-amber-500/[0.04] text-sm text-[#a0a0a6]">
          High overlap means higher blended TER without diversification benefit. Consider swapping one fund.
        </div>
      )}
    </section>
  );
}
