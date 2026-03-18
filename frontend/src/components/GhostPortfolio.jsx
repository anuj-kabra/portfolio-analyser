import { useState } from "react";
import { ghostSummaryText, stockStressTest } from "../lib/ghostPortfolio";

const INR = new Intl.NumberFormat("en-IN");

function hhiTone(hhi) {
  if (hhi < 10) return "text-emerald-400";
  if (hhi <= 25) return "text-amber-400";
  return "text-red-400";
}

function shortName(name) {
  return String(name || "").split(" Fund")[0];
}

export default function GhostPortfolio({ ghost, niftyComparison, fundContributions, capBreakdown }) {
  const [stressDropPct, setStressDropPct] = useState(20);

  if (!ghost) return null;
  const summary = ghostSummaryText(ghost);
  const fundCount = ghost.fundTERs?.length ?? 0;
  const stressResult = stockStressTest(ghost.holdings, stressDropPct, 10);

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

      {/* Stock Stress Test */}
      <div className="card p-4 border-red-500/20 bg-red-500/[0.04]">
        <h3 className="text-xs font-medium text-white mb-3">Stock Stress Test</h3>
        <p className="text-xs text-[#a0a0a6] mb-3">
          If your top 10 holdings each drop by {stressDropPct}%, your portfolio loses:
        </p>
        <div className="flex items-center gap-4 mb-3">
          <label className="text-[11px] text-[#5c5c63] w-16 shrink-0">Drop {stressDropPct}%</label>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={stressDropPct}
            onChange={(e) => setStressDropPct(Number(e.target.value))}
            className="flex-1"
          />
        </div>
        <div className="flex items-baseline gap-3 mt-2">
          <span className="text-2xl font-semibold text-red-400">
            -INR {INR.format(stressResult.lossRupees)}
          </span>
          <span className="text-xs text-[#5c5c63]">
            on {stressResult.totalAffectedWeight}% of portfolio
          </span>
        </div>
        <div className="mt-3 space-y-1">
          {stressResult.holdings.slice(0, 5).map((h) => (
            <div key={h.ticker} className="flex justify-between text-[11px]">
              <span className="text-[#a0a0a6]">{h.name}</span>
              <span className="text-red-400/80">-INR {INR.format(h.stressLoss)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Market Cap Breakdown */}
      {capBreakdown?.length > 0 && (
        <div className="card p-4">
          <h3 className="text-xs font-medium text-white mb-3">Market Cap Breakdown</h3>
          <div className="space-y-2">
            {capBreakdown.map((cap) => (
              <div key={cap.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#a0a0a6]">{cap.label}</span>
                  <span className="text-[#ececed]">{cap.weight}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05]">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                    style={{ width: `${Math.min(cap.weight, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#5c5c63] mt-2">
            Classification uses Nifty 50 constituents as large-cap proxy.
          </p>
        </div>
      )}

      {/* Nifty Comparison */}
      {niftyComparison && (
        <div className="card p-4">
          <h3 className="text-xs font-medium text-white mb-3">vs Nifty 50 Benchmark</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#a0a0a6]">Concentration (HHI)</span>
              <span className="flex items-center gap-2">
                <span className="text-[#5c5c63]">Nifty {niftyComparison.niftyHhi}</span>
                <span className="text-[#5c5c63]">→</span>
                <span className={niftyComparison.hhiDiff > 0 ? "text-amber-400" : "text-emerald-400"}>
                  You {niftyComparison.portfolioHhi}
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a0a0a6]">Expense ratio (TER)</span>
              <span className="flex items-center gap-2">
                <span className="text-[#5c5c63]">Nifty 0.10%</span>
                <span className="text-[#5c5c63]">→</span>
                <span className={niftyComparison.terDiff > 0 ? "text-amber-400" : "text-emerald-400"}>
                  You {ghost.effectiveTER}%
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a0a0a6]">Nifty stock overlap</span>
              <span className="text-[#ececed]">
                {niftyComparison.ownedNiftyCount} of {niftyComparison.niftyStockCount} stocks ({niftyComparison.niftyOverlapPct}%)
              </span>
            </div>
            {niftyComparison.annualExcessFee > 0 && (
              <div className="flex justify-between">
                <span className="text-[#a0a0a6]">Annual excess fees</span>
                <span className="text-amber-400">INR {INR.format(niftyComparison.annualExcessFee)}/yr</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fund Contributions */}
      {fundContributions?.length > 0 && (
        <div className="card p-4">
          <h3 className="text-xs font-medium text-white mb-3">Fund Contributions</h3>
          <div className="space-y-3">
            {fundContributions.map((fc) => (
              <div key={fc.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#ececed]">{shortName(fc.name)}</span>
                  <span className="text-[#5c5c63]">
                    {fc.weight}% · TER {fc.ter}% · INR {INR.format(fc.annualCost)}/yr
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.05]">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                    style={{ width: `${Math.min(fc.weight, 100)}%` }}
                  />
                </div>
                {fc.topHolding && (
                  <div className="text-[10px] text-[#5c5c63] mt-0.5">
                    Top: {fc.topHolding} ({fc.topHoldingWeight}%)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
