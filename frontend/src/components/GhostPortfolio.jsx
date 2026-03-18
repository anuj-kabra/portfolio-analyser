import { ghostSummaryText } from "../lib/ghostPortfolio";

const INR = new Intl.NumberFormat("en-IN");

function hhiTone(hhi) {
  if (hhi < 1000) return "text-emerald-400";
  if (hhi <= 2500) return "text-amber-400";
  return "text-red-400";
}

export default function GhostPortfolio({ ghost }) {
  if (!ghost) return null;
  const summary = ghostSummaryText(ghost);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-white">Ghost Portfolio</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="card p-3">
          <div className="text-[11px] text-[#5c5c63]">Unique stocks</div>
          <div className="text-lg text-[#ececed]">{ghost.totalStocks}</div>
        </div>
        <div className="card p-3">
          <div className="text-[11px] text-[#5c5c63]">In 2+ funds</div>
          <div className="text-lg text-amber-400">{ghost.redundantStocks}</div>
        </div>
        <div className="card p-3">
          <div className="text-[11px] text-[#5c5c63]">In all funds</div>
          <div className="text-lg text-red-400">{ghost.tripleHeld}</div>
        </div>
        <div className="card p-3">
          <div className="text-[11px] text-[#5c5c63]">HHI</div>
          <div className={`text-lg ${hhiTone(ghost.hhi)}`}>{ghost.hhi}</div>
        </div>
      </div>

      <div className="overflow-x-auto card">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-4 py-2 text-xs text-[#5c5c63]">Stock</th>
              <th className="text-right px-4 py-2 text-xs text-[#5c5c63]">Weight</th>
              <th className="text-right px-4 py-2 text-xs text-[#5c5c63]">Amount</th>
              <th className="text-right px-4 py-2 text-xs text-[#5c5c63]">Funds</th>
            </tr>
          </thead>
          <tbody>
            {ghost.top20.map((stock) => (
              <tr key={stock.ticker} className="border-b border-white/[0.03]">
                <td className="px-4 py-2 text-[#ececed]">{stock.name}</td>
                <td className="px-4 py-2 text-right text-[#a0a0a6]">{stock.effectiveWeight.toFixed(1)}%</td>
                <td className="px-4 py-2 text-right text-[#ececed]">INR {INR.format(stock.investedAmount)}</td>
                <td className="px-4 py-2 text-right text-[#5c5c63]">{stock.heldBy.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ghost.excessFee > 0 ? (
        <div className="card p-4 border-amber-500/20 bg-amber-500/[0.04] text-sm text-[#a0a0a6]">
          Combined fee: <span className="text-[#ececed]">INR {INR.format(ghost.annualFeeRupees)}</span> yearly
          (effective TER {ghost.effectiveTER}%). Equivalent low-cost index proxy:{" "}
          <span className="text-[#ececed]">INR {INR.format(ghost.indexFundFee)}</span>. Excess:{" "}
          <span className="text-amber-300">INR {INR.format(ghost.excessFee)}</span>.
        </div>
      ) : null}

      <div className="text-sm text-[#a0a0a6] leading-relaxed">
        <p>{summary.line1}</p>
        <p>{summary.line2}</p>
        <p>{summary.line3}</p>
      </div>
    </section>
  );
}
