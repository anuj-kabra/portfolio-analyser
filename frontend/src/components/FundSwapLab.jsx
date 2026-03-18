import { useMemo, useState } from "react";
import { rankReplacements, simulateSwap, simulateRebalance, optimizeAmounts, checkFitment } from "../lib/fundSwap";

const INR = new Intl.NumberFormat("en-IN");

function shortName(name) {
  return String(name || "").split(" Fund")[0];
}

const MODES = [
  { id: "swap", label: "Swap" },
  { id: "rebalance", label: "Rebalance" },
  { id: "fitment", label: "Fitment" },
];

export default function FundSwapLab({ portfolio, allFunds }) {
  const [mode, setMode] = useState("swap");

  // Swap mode state
  const [selectedFundIdx, setSelectedFundIdx] = useState(null);
  const [selectedReplacementId, setSelectedReplacementId] = useState("");

  // Rebalance mode state
  const [rebalanceAmounts, setRebalanceAmounts] = useState(() =>
    portfolio.map((item) => Number(item?.amount) || 0)
  );
  const [rebalanceResult, setRebalanceResult] = useState(null);

  // Fitment mode state
  const [fitmentFundId, setFitmentFundId] = useState("");

  const hasAnySwaps = useMemo(() => {
    return portfolio.some((_, idx) => rankReplacements(portfolio, idx, allFunds).length > 0);
  }, [portfolio, allFunds]);

  const candidates = useMemo(() => {
    if (selectedFundIdx === null) return [];
    return rankReplacements(portfolio, selectedFundIdx, allFunds);
  }, [portfolio, selectedFundIdx, allFunds]);

  const selectedReplacement = candidates.find((item) => item.fund.id === selectedReplacementId)?.fund;
  const swapResult = useMemo(() => {
    if (selectedFundIdx === null || !selectedReplacement) return null;
    return simulateSwap(portfolio, selectedFundIdx, selectedReplacement);
  }, [portfolio, selectedFundIdx, selectedReplacement]);

  const totalInvested = portfolio.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

  const fitmentFund = allFunds.find((f) => f.id === fitmentFundId);
  const fitmentResult = useMemo(() => {
    if (!fitmentFund) return null;
    return checkFitment(portfolio, fitmentFund);
  }, [portfolio, fitmentFund]);

  const fitmentCandidates = useMemo(() => {
    const inPortfolio = new Set(portfolio.map((item) => item.fund.id));
    return allFunds.filter((f) => !inPortfolio.has(f.id)).slice(0, 100);
  }, [portfolio, allFunds]);

  function handleOptimize() {
    const optimal = optimizeAmounts(portfolio);
    setRebalanceAmounts(optimal);
    const result = simulateRebalance(portfolio, optimal);
    setRebalanceResult(result);
  }

  function handleRebalanceChange(idx, value) {
    const next = [...rebalanceAmounts];
    next[idx] = Math.max(0, Number(value) || 0);
    setRebalanceAmounts(next);
    const result = simulateRebalance(portfolio, next);
    setRebalanceResult(result);
  }

  const savingsBreakdown = swapResult
    ? [
        swapResult.delta.crashLossSaved > 0 && `INR ${INR.format(swapResult.delta.crashLossSaved)} crash risk reduction`,
        (swapResult.delta.terSavingsRupees || 0) > 0 &&
          `INR ${INR.format(swapResult.delta.terSavingsRupees)} lower fees`,
      ].filter(Boolean)
    : [];

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-white">Fund Swap Lab</h2>

      {/* Mode Toggle */}
      <div className="card p-1 inline-flex gap-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              mode === m.id ? "bg-white text-[#0a0a0b]" : "text-[#a0a0a6] hover:bg-white/[0.04]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── SWAP MODE ── */}
      {mode === "swap" && (
        <>
          {!hasAnySwaps ? (
            <p className="text-sm text-[#5c5c63]">No swaps available for this portfolio.</p>
          ) : (
            <>
              <div className="card p-4">
                <div className="text-xs text-[#5c5c63] mb-2">Step 1: Select fund to replace</div>
                <div className="grid sm:grid-cols-3 gap-2">
                  {portfolio.map((entry, idx) => {
                    const fundCandidates = rankReplacements(portfolio, idx, allFunds);
                    const hasCandidates = fundCandidates.length > 0;
                    return (
                      <button
                        key={entry.fund.id}
                        type="button"
                        disabled={!hasCandidates}
                        onClick={() => {
                          if (hasCandidates) {
                            setSelectedFundIdx(idx);
                            setSelectedReplacementId("");
                          }
                        }}
                        className={`rounded-lg border px-3 py-2 text-left ${
                          !hasCandidates
                            ? "border-white/[0.04] bg-white/[0.02] opacity-50 cursor-not-allowed"
                            : selectedFundIdx === idx
                              ? "border-red-500/40 bg-red-500/[0.08]"
                              : "border-white/[0.08] bg-white/[0.03]"
                        }`}
                      >
                        <div className="text-xs text-[#ececed]">{shortName(entry.fund.name)}</div>
                        <div className="text-[11px] text-[#5c5c63] mt-0.5">
                          INR {INR.format(entry.amount)} · {entry.fund.category}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedFundIdx !== null && candidates.length === 0 && (
                <p className="text-xs text-[#5c5c63]">No same-category alternatives available for the selected fund.</p>
              )}

              {selectedFundIdx !== null && candidates.length > 0 && (
                <div className="card p-4">
                  <div className="text-xs text-[#5c5c63] mb-2">Step 2: Choose replacement</div>
                  <div className="space-y-2">
                    {candidates.map((candidate) => (
                      <button
                        key={candidate.fund.id}
                        type="button"
                        onClick={() => setSelectedReplacementId(candidate.fund.id)}
                        className={`w-full rounded-lg border px-3 py-2 text-left ${
                          selectedReplacementId === candidate.fund.id
                            ? "border-emerald-500/40 bg-emerald-500/[0.08]"
                            : "border-white/[0.08] bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-[#ececed]">{shortName(candidate.fund.name)}</div>
                            <div className="text-[11px] text-[#5c5c63]">{candidate.fund.category}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs ${candidate.delta.overlapChange <= 0 ? "text-emerald-300" : "text-red-300"}`}>
                              {candidate.delta.overlapChange > 0 ? "+" : ""}
                              {candidate.delta.overlapChange}% overlap
                            </div>
                            <div className="text-[11px] text-[#a0a0a6]">
                              Saves INR {INR.format(Math.max(candidate.delta.crashLossSaved, 0))}
                              {(candidate.delta.terSavingsRupees || 0) > 0 &&
                                ` + INR ${INR.format(candidate.delta.terSavingsRupees)} fees`}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {swapResult && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="card p-4">
                    <div className="text-xs text-[#5c5c63] mb-2">Current</div>
                    <div className="text-sm text-[#a0a0a6]">
                      TER: <span className="text-[#ececed]">{swapResult.before.ter}%</span>
                    </div>
                    <div className="text-sm text-[#a0a0a6]">
                      Avg overlap: <span className="text-[#ececed]">{swapResult.before.avgOverlap}%</span>
                    </div>
                    <div className="text-sm text-[#a0a0a6]">
                      Top sector: <span className="text-[#ececed]">{swapResult.before.topSectorPct}%</span>
                    </div>
                    <div className="text-sm text-[#a0a0a6]">
                      Crash loss: <span className="text-red-300">-INR {INR.format(swapResult.before.worstCrashLoss)}</span>
                    </div>
                  </div>
                  <div className="card p-4 border-emerald-500/30 bg-emerald-500/[0.05]">
                    <div className="text-xs text-emerald-300/80 mb-2">After swap</div>
                    <div className="text-sm text-[#a0a0a6]">
                      TER: <span className="text-[#ececed]">{swapResult.after.ter}%</span>{" "}
                      {swapResult.delta.terSavingsRupees > 0 && (
                        <span className="text-emerald-300">(saves INR {INR.format(swapResult.delta.terSavingsRupees)}/yr)</span>
                      )}
                    </div>
                    <div className="text-sm text-[#a0a0a6]">
                      Avg overlap: <span className="text-[#ececed]">{swapResult.after.avgOverlap}%</span>{" "}
                      <span className={swapResult.delta.overlapChange <= 0 ? "text-emerald-300" : "text-red-300"}>
                        ({swapResult.delta.overlapChange > 0 ? "+" : ""}
                        {swapResult.delta.overlapChange})
                      </span>
                    </div>
                    <div className="text-sm text-[#a0a0a6]">
                      Top sector: <span className="text-[#ececed]">{swapResult.after.topSectorPct}%</span>
                    </div>
                    <div className="text-sm text-[#a0a0a6]">
                      Crash loss: <span className="text-emerald-300">-INR {INR.format(swapResult.after.worstCrashLoss)}</span>
                    </div>
                    {savingsBreakdown.length > 0 && (
                      <p className="mt-2 text-xs text-emerald-300/90">
                        Swapping saves {savingsBreakdown.join(" and ")} by reducing duplicate exposure and fund fees.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── REBALANCE MODE ── */}
      {mode === "rebalance" && (
        <div className="space-y-4">
          <p className="text-sm text-[#a0a0a6]">
            Adjust how much you invest in each fund to reduce concentration risk. The optimizer sets equal weights.
          </p>

          <div className="card p-4 space-y-4">
            <div className="text-xs text-[#5c5c63] mb-1">Allocation sliders</div>
            {portfolio.map((entry, idx) => {
              const current = Number(entry.amount) || 0;
              const newAmt = Number(rebalanceAmounts[idx]) || 0;
              const max = Math.max(current * 2, 10000);
              return (
                <div key={entry.fund.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#ececed]">{shortName(entry.fund.name)}</span>
                    <span className="text-[#a0a0a6]">
                      INR {INR.format(newAmt)}
                      {newAmt !== current && (
                        <span className={`ml-1 ${newAmt > current ? "text-amber-400" : "text-emerald-400"}`}>
                          ({newAmt > current ? "+" : ""}
                          {Math.round(((newAmt - current) / current) * 100)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={max}
                    step={Math.round(max / 100)}
                    value={newAmt}
                    onChange={(e) => handleRebalanceChange(idx, e.target.value)}
                    className="w-full"
                  />
                </div>
              );
            })}

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-[#5c5c63]">
                New total: INR {INR.format(rebalanceAmounts.reduce((s, a) => s + a, 0))}
                <span className="text-[#5c5c63] ml-1">(was INR {INR.format(totalInvested)})</span>
              </span>
              <button
                type="button"
                onClick={handleOptimize}
                className="px-3 py-1.5 text-xs rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300 hover:bg-emerald-500/[0.15]"
              >
                Optimize equally
              </button>
            </div>
          </div>

          {rebalanceResult && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="card p-4">
                <div className="text-xs text-[#5c5c63] mb-2">Current</div>
                <div className="text-sm text-[#a0a0a6]">
                  Avg overlap: <span className="text-[#ececed]">{rebalanceResult.before.avgOverlap}%</span>
                </div>
                <div className="text-sm text-[#a0a0a6]">
                  Top sector: <span className="text-[#ececed]">{rebalanceResult.before.topSector}</span>{" "}
                  <span className="text-[#5c5c63]">{rebalanceResult.before.topSectorPct}%</span>
                </div>
              </div>
              <div className={`card p-4 ${
                rebalanceResult.delta.topSectorChange < 0 ? "border-emerald-500/30 bg-emerald-500/[0.05]" : "border-white/[0.06]"
              }`}>
                <div className={`text-xs mb-2 ${rebalanceResult.delta.topSectorChange < 0 ? "text-emerald-300/80" : "text-[#5c5c63]"}`}>
                  After rebalance
                </div>
                <div className="text-sm text-[#a0a0a6]">
                  Avg overlap: <span className="text-[#ececed]">{rebalanceResult.after.avgOverlap}%</span>
                  {rebalanceResult.delta.overlapChange !== 0 && (
                    <span className={`ml-1 text-xs ${rebalanceResult.delta.overlapChange < 0 ? "text-emerald-400" : "text-red-400"}`}>
                      ({rebalanceResult.delta.overlapChange > 0 ? "+" : ""}{rebalanceResult.delta.overlapChange})
                    </span>
                  )}
                </div>
                <div className="text-sm text-[#a0a0a6]">
                  Top sector: <span className="text-[#ececed]">{rebalanceResult.after.topSector}</span>{" "}
                  <span className={rebalanceResult.delta.topSectorChange < 0 ? "text-emerald-400" : "text-amber-400"}>
                    {rebalanceResult.after.topSectorPct}%
                    {rebalanceResult.delta.topSectorChange !== 0 && (
                      <span className="ml-1">
                        ({rebalanceResult.delta.topSectorChange > 0 ? "+" : ""}
                        {rebalanceResult.delta.topSectorChange})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FITMENT MODE ── */}
      {mode === "fitment" && (
        <div className="space-y-4">
          <p className="text-sm text-[#a0a0a6]">
            Check whether adding a new fund would improve or hurt your portfolio.
          </p>

          <div className="card p-4">
            <div className="text-xs text-[#5c5c63] mb-2">Select fund to evaluate</div>
            <select
              value={fitmentFundId}
              onChange={(e) => setFitmentFundId(e.target.value)}
              className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] text-[#ececed] px-3 py-2 text-sm"
            >
              <option value="" className="bg-[#141415]">— pick a fund —</option>
              {fitmentCandidates.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#141415]">
                  {f.name} ({f.category})
                </option>
              ))}
            </select>
          </div>

          {fitmentResult && (
            <div className={`card p-4 border-${fitmentResult.verdictColor}-500/20 bg-${fitmentResult.verdictColor}-500/[0.05]`}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-white">{shortName(fitmentResult.candidateFund?.name || "")}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full border border-${fitmentResult.verdictColor}-500/30 text-${fitmentResult.verdictColor}-300`}>
                  {fitmentResult.verdict}
                </span>
              </div>
              <div className="space-y-1.5">
                {fitmentResult.verdicts.map((v, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-[#5c5c63] mt-0.5">•</span>
                    <span className="text-[#a0a0a6]">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#5c5c63]">Overlap change </span>
                  <span className={fitmentResult.overlapChange <= 0 ? "text-emerald-400" : "text-amber-400"}>
                    {fitmentResult.overlapChange > 0 ? "+" : ""}{fitmentResult.overlapChange}%
                  </span>
                </div>
                <div>
                  <span className="text-[#5c5c63]">TER vs avg </span>
                  <span className={fitmentResult.terDiff <= 0 ? "text-emerald-400" : "text-amber-400"}>
                    {fitmentResult.terDiff > 0 ? "+" : ""}{fitmentResult.terDiff}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
