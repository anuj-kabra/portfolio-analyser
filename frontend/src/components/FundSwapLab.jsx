import { useMemo, useState } from "react";
import { rankReplacements, simulateSwap } from "../lib/fundSwap";

const INR = new Intl.NumberFormat("en-IN");

function shortName(name) {
  return String(name || "").split(" Fund")[0];
}

export default function FundSwapLab({ portfolio, allFunds }) {
  const [selectedFundIdx, setSelectedFundIdx] = useState(null);
  const [selectedReplacementId, setSelectedReplacementId] = useState("");

  const candidates = useMemo(() => {
    if (selectedFundIdx === null) return [];
    return rankReplacements(portfolio, selectedFundIdx, allFunds);
  }, [portfolio, selectedFundIdx, allFunds]);

  const selectedReplacement = candidates.find((item) => item.fund.id === selectedReplacementId)?.fund;
  const swapResult = useMemo(() => {
    if (selectedFundIdx === null || !selectedReplacement) return null;
    return simulateSwap(portfolio, selectedFundIdx, selectedReplacement);
  }, [portfolio, selectedFundIdx, selectedReplacement]);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-white">Fund Swap Lab</h2>

      <div className="card p-4">
        <div className="text-xs text-[#5c5c63] mb-2">Step 1: Select fund to replace</div>
        <div className="grid sm:grid-cols-3 gap-2">
          {portfolio.map((entry, idx) => (
            <button
              key={entry.fund.id}
              type="button"
              onClick={() => {
                setSelectedFundIdx(idx);
                setSelectedReplacementId("");
              }}
              className={`rounded-lg border px-3 py-2 text-left ${
                selectedFundIdx === idx ? "border-red-500/40 bg-red-500/[0.08]" : "border-white/[0.08] bg-white/[0.03]"
              }`}
            >
              <div className="text-xs text-[#ececed]">{shortName(entry.fund.name)}</div>
              <div className="text-[11px] text-[#5c5c63] mt-0.5">
                INR {INR.format(entry.amount)} · {entry.fund.category}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedFundIdx !== null ? (
        <div className="card p-4">
          <div className="text-xs text-[#5c5c63] mb-2">Step 2: Choose replacement</div>
          {candidates.length === 0 ? (
            <p className="text-xs text-[#a0a0a6]">No same-category alternatives available in current dataset.</p>
          ) : (
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
                      <div className="text-[11px] text-[#a0a0a6]">Saves INR {INR.format(Math.max(candidate.delta.crashLossSaved, 0))}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {swapResult ? (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="card p-4">
            <div className="text-xs text-[#5c5c63] mb-2">Current</div>
            <div className="text-sm text-[#a0a0a6]">Avg overlap: <span className="text-[#ececed]">{swapResult.before.avgOverlap}%</span></div>
            <div className="text-sm text-[#a0a0a6]">Top sector: <span className="text-[#ececed]">{swapResult.before.topSectorPct}%</span></div>
            <div className="text-sm text-[#a0a0a6]">Crash loss: <span className="text-red-300">-INR {INR.format(swapResult.before.worstCrashLoss)}</span></div>
          </div>
          <div className="card p-4 border-emerald-500/30 bg-emerald-500/[0.05]">
            <div className="text-xs text-emerald-300/80 mb-2">After swap</div>
            <div className="text-sm text-[#a0a0a6]">
              Avg overlap: <span className="text-[#ececed]">{swapResult.after.avgOverlap}%</span>{" "}
              <span className={swapResult.delta.overlapChange <= 0 ? "text-emerald-300" : "text-red-300"}>
                ({swapResult.delta.overlapChange > 0 ? "+" : ""}
                {swapResult.delta.overlapChange})
              </span>
            </div>
            <div className="text-sm text-[#a0a0a6]">Top sector: <span className="text-[#ececed]">{swapResult.after.topSectorPct}%</span></div>
            <div className="text-sm text-[#a0a0a6]">
              Crash loss: <span className="text-emerald-300">-INR {INR.format(swapResult.after.worstCrashLoss)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
