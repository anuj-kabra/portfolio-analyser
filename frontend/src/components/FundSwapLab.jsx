import { useMemo, useState } from "react";
import { rankReplacements, simulateSwap } from "../lib/fundSwap";

const INR = new Intl.NumberFormat("en-IN");

function shortName(name) {
  return String(name || "").split(" Fund")[0];
}

export default function FundSwapLab({ portfolio, allFunds }) {
  const [selectedFundIdx, setSelectedFundIdx] = useState(null);
  const [selectedReplacementId, setSelectedReplacementId] = useState("");

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

  if (!hasAnySwaps) {
    return (
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-white">Fund Swap Lab</h2>
        <p className="text-sm text-[#5c5c63]">No swaps available for this portfolio.</p>
      </section>
    );
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

      {selectedFundIdx !== null && candidates.length === 0 ? (
        <p className="text-xs text-[#5c5c63]">No same-category alternatives available for the selected fund.</p>
      ) : null}

      {selectedFundIdx !== null && candidates.length > 0 ? (
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
      ) : null}

      {swapResult ? (
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
      ) : null}
    </section>
  );
}
