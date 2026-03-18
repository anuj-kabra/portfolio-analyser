import { analyseOverlap } from "./overlap.js";
import { computeSectorExposure, simulateCrash } from "./sectorRisk.js";

export function simulateSwap(currentPortfolio, removeIndex, replacementFund) {
  const replaced = currentPortfolio[removeIndex];
  if (!replaced || !replacementFund) return null;

  const newPortfolio = currentPortfolio.map((entry, index) =>
    index === removeIndex ? { fund: replacementFund, amount: entry.amount } : entry
  );

  const beforeOverlap = analyseOverlap(currentPortfolio);
  const afterOverlap = analyseOverlap(newPortfolio);
  const beforeSector = computeSectorExposure(currentPortfolio);
  const afterSector = computeSectorExposure(newPortfolio);
  const totalInvested = currentPortfolio.reduce((sum, item) => sum + item.amount, 0);

  const beforeTopSector = Object.keys(beforeSector)[0] || "";
  const afterTopSector = Object.keys(afterSector)[0] || "";
  const beforeCrash = simulateCrash(totalInvested, beforeSector, beforeTopSector, 30);
  const afterCrash = simulateCrash(totalInvested, afterSector, afterTopSector, 30);

  return {
    removedFund: replaced.fund,
    replacementFund,
    before: {
      avgOverlap: beforeOverlap.averageOverlapPct,
      topSector: beforeTopSector,
      topSectorPct: beforeSector[beforeTopSector]?.weightPct || 0,
      worstCrashLoss: beforeCrash.rupeeLoss,
    },
    after: {
      avgOverlap: afterOverlap.averageOverlapPct,
      topSector: afterTopSector,
      topSectorPct: afterSector[afterTopSector]?.weightPct || 0,
      worstCrashLoss: afterCrash.rupeeLoss,
    },
    delta: {
      overlapChange: +(afterOverlap.averageOverlapPct - beforeOverlap.averageOverlapPct).toFixed(1),
      topSectorChange: +(
        (afterSector[afterTopSector]?.weightPct || 0) - (beforeSector[beforeTopSector]?.weightPct || 0)
      ).toFixed(1),
      crashLossSaved: beforeCrash.rupeeLoss - afterCrash.rupeeLoss,
    },
  };
}

export function rankReplacements(currentPortfolio, removeIndex, allFunds) {
  const removed = currentPortfolio[removeIndex]?.fund;
  if (!removed) return [];

  const inPortfolio = new Set(currentPortfolio.map((item) => item.fund.id));
  const candidates = allFunds.filter((fund) => fund.category === removed.category && !inPortfolio.has(fund.id));
  const scored = candidates.map((fund) => {
    const simulation = simulateSwap(currentPortfolio, removeIndex, fund);
    const score = -simulation.delta.overlapChange * 0.7 + (simulation.delta.crashLossSaved / 1000) * 0.3;
    return { ...simulation, fund, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}
