import { ghostSummaryText } from "../lib/ghostPortfolio";

const INR = new Intl.NumberFormat("en-IN");

function hhiTone(hhi) {
  if (hhi < 1000) return "text-emerald-400";
  if (hhi <= 2500) return "text-amber-400";
  return "text-red-400";
}

function shortName(name) {
  return String(name || "").split(" Fund")[0];
}

export default function GhostPortfolio({ ghost }) {
  if (!ghost) return null;
  const summary = ghostSummaryText(ghost);
  const fundCount = ghost.fundTERs?.length ?? 0;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-white">Fund X-Ray</h2>

      <p className="text-sm text-[#a0a0a6] leading-relaxed">
        Merges all your mutual funds into one unified view — showing what you actually own across all funds and how much
        duplication exists.
      </p>

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

      <div className="card p-4">
        <h3 className="text-xs font-medium text-white mb-3">Expense Ratio Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-2 text-xs text-[#5c5c63]">Fund</th>
                <th className="text-right px-4 py-2 text-xs text-[#5c5c63]">TER %</th>
                <th className="text-right px-4 py-2 text-xs text-[#5c5c63]">Annual cost</th>
              </tr>
            </thead>
            <tbody>
              {(ghost.fundTERs || []).map((f) => (
                <tr key={f.name} className="border-b border-white/[0.03]">
                  <td className="px-4 py-2 text-[#ececed]">{shortName(f.name)}</td>
                  <td className="px-4 py-2 text-right text-[#a0a0a6]">{f.ter}%</td>
                  <td className="px-4 py-2 text-right text-[#ececed]">INR {INR.format(f.annualCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-[#a0a0a6] space-y-1">
          <div className="flex justify-between">
            <span>Effective blended TER</span>
            <span className="text-[#ececed]">{ghost.effectiveTER}%</span>
          </div>
          <div className="flex justify-between">
            <span>Total annual fees</span>
            <span className="text-[#ececed]">INR {INR.format(ghost.annualFeeRupees)}</span>
          </div>
          <div className="flex justify-between">
            <span>Equivalent index fund (0.1%)</span>
            <span className="text-[#ececed]">INR {INR.format(ghost.indexFundFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>Excess fees paid</span>
            <span className={ghost.excessFee > 0 ? "text-amber-300" : "text-emerald-400"}>
              INR {INR.format(ghost.excessFee)}
            </span>
          </div>
        </div>
        {fundCount > 1 && ghost.redundantStocks > 0 && (
          <p className="mt-3 text-xs text-[#a0a0a6]">
            Paying {fundCount} fund managers for overlapping stocks means you pay duplicate TER on {ghost.redundantStocks}{" "}
            shared positions.
          </p>
        )}
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

      <div className="text-sm text-[#a0a0a6] leading-relaxed">
        <p>{summary.line1}</p>
        <p>{summary.line2}</p>
        <p>{summary.line3}</p>
      </div>
    </section>
  );
}
