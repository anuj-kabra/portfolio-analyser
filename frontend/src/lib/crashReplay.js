import { HISTORICAL_CRASHES } from "../data/historicalCrashes.js";
import { CRASH_RECOVERY } from "../data/crashRecovery.js";

export function replayCrash(totalInvested, sectorExposure, crashEvent) {
  const sectorLosses = [];
  let totalLoss = 0;

  for (const [sector, data] of Object.entries(sectorExposure || {})) {
    const drawdown = Number(crashEvent?.sectorDrawdowns?.[sector] || 0);
    if (!drawdown) continue;
    const loss = Math.round((Number(data?.rupeeAmount || 0) * Math.abs(drawdown)) / 100);
    totalLoss += loss;
    sectorLosses.push({
      sector,
      exposurePct: data.weightPct,
      drawdownPct: drawdown,
      lossRupees: loss,
    });
  }

  sectorLosses.sort((a, b) => b.lossRupees - a.lossRupees);
  const portfolioLossPct = totalInvested ? +((totalLoss / totalInvested) * 100).toFixed(1) : 0;

  return {
    event: crashEvent,
    totalInvested,
    totalLoss,
    portfolioLossPct,
    surviving: Math.max(totalInvested - totalLoss, 0),
    sectorLosses,
  };
}

export function replayAllCrashes(totalInvested, sectorExposure) {
  return HISTORICAL_CRASHES.map((event) => replayCrash(totalInvested, sectorExposure, event)).sort(
    (a, b) => b.totalLoss - a.totalLoss
  );
}

/**
 * For a given replay, returns per-sector recovery time in months.
 */
export function computeRecoveryTimeline(replay) {
  const recoveryData = CRASH_RECOVERY[replay.event.id] || {};
  return replay.sectorLosses
    .map((sl) => ({
      sector: sl.sector,
      lossRupees: sl.lossRupees,
      drawdownPct: sl.drawdownPct,
      recoveryMonths: recoveryData[sl.sector] ?? 18,
    }))
    .sort((a, b) => b.recoveryMonths - a.recoveryMonths);
}

/**
 * Compute estimated loss per fund for a specific crash event using
 * each fund's normalizedSectorWeights.
 */
export function computePerFundLoss(portfolio, crashEvent) {
  if (!portfolio?.length || !crashEvent) return [];
  return portfolio.map((item) => {
    const amount = Number(item?.amount) || 0;
    const weights = item?.fund?.normalizedSectorWeights || item?.fund?.sectorWeights || {};
    let lossPct = 0;
    for (const [sector, sectorPct] of Object.entries(weights)) {
      const drawdown = Math.abs(Number(crashEvent?.sectorDrawdowns?.[sector] || 0));
      lossPct += (Number(sectorPct) / 100) * drawdown;
    }
    const lossRupees = Math.round((amount * lossPct) / 100);
    return {
      name: item.fund.name,
      amount,
      lossPct: +lossPct.toFixed(1),
      lossRupees,
      surviving: Math.max(amount - lossRupees, 0),
    };
  });
}

/**
 * Compare portfolio drawdown vs Nifty 50 drawdown for a given replay.
 */
export function portfolioVsNifty(replay) {
  const niftyLossPct = Math.abs(Number(replay.event.niftyDrawdown || 0));
  const diff = +(replay.portfolioLossPct - niftyLossPct).toFixed(1);
  return {
    portfolioLossPct: replay.portfolioLossPct,
    niftyLossPct,
    diff,
    betterThanNifty: diff < 0,
  };
}
