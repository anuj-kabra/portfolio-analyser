import { analyseOverlap } from "./overlap.js";
import { computeSectorExposure, simulateCrash } from "./sectorRisk.js";

function normalizeFundName(name) {
  return String(name || "").trim().toLowerCase();
}

function schemeKey(name) {
  return normalizeFundName(name)
    .replace(/\([^)]*\)/g, " ")
    .replace(/\bfund\b.*$/, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

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

  const beforeTer = Number(replaced.fund?.ter) || 0.6;
  const afterTer = Number(replacementFund?.ter) || 0.6;
  const amount = Number(replaced.amount) || 0;
  const terSavingsPct = beforeTer - afterTer;
  const terSavingsRupees = Math.round((amount * Math.max(terSavingsPct, 0)) / 100);

  return {
    removedFund: replaced.fund,
    replacementFund,
    before: {
      avgOverlap: beforeOverlap.averageOverlapPct,
      topSector: beforeTopSector,
      topSectorPct: beforeSector[beforeTopSector]?.weightPct || 0,
      worstCrashLoss: beforeCrash.rupeeLoss,
      ter: beforeTer,
    },
    after: {
      avgOverlap: afterOverlap.averageOverlapPct,
      topSector: afterTopSector,
      topSectorPct: afterSector[afterTopSector]?.weightPct || 0,
      worstCrashLoss: afterCrash.rupeeLoss,
      ter: afterTer,
    },
    delta: {
      overlapChange: +(afterOverlap.averageOverlapPct - beforeOverlap.averageOverlapPct).toFixed(1),
      topSectorChange: +(
        (afterSector[afterTopSector]?.weightPct || 0) - (beforeSector[beforeTopSector]?.weightPct || 0)
      ).toFixed(1),
      crashLossSaved: beforeCrash.rupeeLoss - afterCrash.rupeeLoss,
      terSavingsPct,
      terSavingsRupees,
    },
  };
}

export function rankReplacements(currentPortfolio, removeIndex, allFunds) {
  const removed = currentPortfolio[removeIndex]?.fund;
  if (!removed) return [];

  const inPortfolio = new Set(currentPortfolio.map((item) => item.fund.id));
  const inPortfolioNames = new Set(currentPortfolio.map((item) => normalizeFundName(item.fund.name)));
  const inPortfolioSchemeKeys = new Set(currentPortfolio.map((item) => schemeKey(item.fund.name)));
  const removedName = normalizeFundName(removed.name);
  const removedSchemeKey = schemeKey(removed.name);
  const candidates = allFunds.filter(
    (fund) =>
      fund.id !== removed.id &&
      normalizeFundName(fund.name) !== removedName &&
      schemeKey(fund.name) !== removedSchemeKey &&
      fund.category === removed.category &&
      !inPortfolio.has(fund.id) &&
      !inPortfolioNames.has(normalizeFundName(fund.name)) &&
      !inPortfolioSchemeKeys.has(schemeKey(fund.name))
  );
  const scored = candidates.map((fund) => {
    const simulation = simulateSwap(currentPortfolio, removeIndex, fund);
    const score = -simulation.delta.overlapChange * 0.7 + (simulation.delta.crashLossSaved / 1000) * 0.3;
    return { ...simulation, fund, score };
  });

  const uniqueByScheme = new Map();
  for (const candidate of scored) {
    const key = schemeKey(candidate.fund.name);
    const existing = uniqueByScheme.get(key);
    if (!existing) {
      uniqueByScheme.set(key, candidate);
      continue;
    }

    const candidateIsMock = Boolean(candidate.fund.isMock);
    const existingIsMock = Boolean(existing.fund.isMock);
    if (existingIsMock && !candidateIsMock) {
      uniqueByScheme.set(key, candidate);
      continue;
    }
    if (existingIsMock === candidateIsMock) {
      const candidateTer = Number(candidate.fund.ter) || 0;
      const existingTer = Number(existing.fund.ter) || 0;
      if (candidateTer < existingTer) {
        uniqueByScheme.set(key, candidate);
        continue;
      }
      if (candidateTer === existingTer && candidate.score > existing.score) {
        uniqueByScheme.set(key, candidate);
      }
    }
  }

  const deduped = Array.from(uniqueByScheme.values());
  deduped.sort((a, b) => b.score - a.score);
  return deduped.slice(0, 5);
}

/**
 * Simulate rebalancing the portfolio using new allocation amounts.
 * newAmounts is an array of INR amounts parallel to portfolio entries.
 */
export function simulateRebalance(portfolio, newAmounts) {
  if (!portfolio?.length) return null;
  const newPortfolio = portfolio.map((item, i) => ({
    ...item,
    amount: Number(newAmounts?.[i]) || item.amount,
  }));

  const beforeOverlap = analyseOverlap(portfolio);
  const afterOverlap = analyseOverlap(newPortfolio);
  const beforeSector = computeSectorExposure(portfolio);
  const afterSector = computeSectorExposure(newPortfolio);

  const topBefore = Object.keys(beforeSector)[0] || "";
  const topAfter = Object.keys(afterSector)[0] || "";

  return {
    before: {
      avgOverlap: beforeOverlap.averageOverlapPct,
      topSector: topBefore,
      topSectorPct: beforeSector[topBefore]?.weightPct || 0,
    },
    after: {
      avgOverlap: afterOverlap.averageOverlapPct,
      topSector: topAfter,
      topSectorPct: afterSector[topAfter]?.weightPct || 0,
    },
    delta: {
      overlapChange: +(afterOverlap.averageOverlapPct - beforeOverlap.averageOverlapPct).toFixed(1),
      topSectorChange: +((afterSector[topAfter]?.weightPct || 0) - (beforeSector[topBefore]?.weightPct || 0)).toFixed(1),
    },
    newPortfolio,
  };
}

/**
 * Return optimal equal-weight amounts (minimize concentration) keeping total fixed.
 */
export function optimizeAmounts(portfolio) {
  if (!portfolio?.length) return [];
  const totalInvested = portfolio.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  if (!totalInvested) return portfolio.map(() => 0);
  const base = Math.floor(totalInvested / portfolio.length);
  const remainder = totalInvested - base * portfolio.length;
  return portfolio.map((_, i) => base + (i === 0 ? remainder : 0));
}

/**
 * Check whether a candidate fund is a good fit to add to the portfolio.
 */
export function checkFitment(portfolio, candidateFund) {
  if (!candidateFund || !portfolio?.length) return null;
  const totalInvested = portfolio.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  const avgAmount = Math.round(totalInvested / portfolio.length);
  const tempPortfolio = [...portfolio, { fund: candidateFund, amount: avgAmount }];

  const beforeOverlap = analyseOverlap(portfolio);
  const afterOverlap = analyseOverlap(tempPortfolio);
  const beforeSector = computeSectorExposure(portfolio);
  const afterSector = computeSectorExposure(tempPortfolio);

  const sameCategory = portfolio.filter((item) => item.fund.category === candidateFund.category).length;
  const avgTer = portfolio.reduce((sum, item) => sum + (Number(item?.fund?.ter) || 0.6), 0) / portfolio.length;
  const candidateTer = Number(candidateFund.ter) || 0.6;
  const overlapChange = +(afterOverlap.averageOverlapPct - beforeOverlap.averageOverlapPct).toFixed(1);
  const topBefore = Object.keys(beforeSector)[0] || "";
  const topAfter = Object.keys(afterSector)[0] || "";
  const concentrationChange = +((afterSector[topAfter]?.weightPct || 0) - (beforeSector[topBefore]?.weightPct || 0)).toFixed(1);

  const verdicts = [];
  if (sameCategory > 0) verdicts.push(`${sameCategory} existing fund(s) in same category`);
  if (overlapChange <= 0) verdicts.push("Zero overlap increase — diversifying");
  else if (overlapChange <= 5) verdicts.push(`Modest overlap increase: +${overlapChange}%`);
  else verdicts.push(`High overlap increase: +${overlapChange}%`);
  if (candidateTer > avgTer + 0.2) verdicts.push(`TER ${candidateTer}% above portfolio avg`);
  else verdicts.push(`TER ${candidateTer}% — competitive`);

  const score =
    (overlapChange <= 0 ? 20 : -overlapChange * 2) +
    (sameCategory === 0 ? 10 : -5) +
    (candidateTer <= avgTer ? 5 : 0);

  return {
    overlapChange,
    concentrationChange,
    sameCategory,
    terDiff: +(candidateTer - avgTer).toFixed(2),
    verdicts,
    score: +score.toFixed(1),
    verdict: score >= 20 ? "Strong fit" : score >= 5 ? "Good fit" : score >= -5 ? "Neutral" : "Poor fit",
    verdictColor: score >= 20 ? "emerald" : score >= 5 ? "emerald" : score >= -5 ? "amber" : "red",
  };
}
