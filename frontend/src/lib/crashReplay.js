import { HISTORICAL_CRASHES } from "../data/historicalCrashes.js";

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
