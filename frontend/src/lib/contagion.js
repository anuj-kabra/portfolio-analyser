import { getCorrelationMap } from "../data/sectorCorrelations.js";

const corrMap = getCorrelationMap();

export function simulateContagion(totalInvested, sectorExposure, triggerSector, triggerCrashPct) {
  const base = sectorExposure?.[triggerSector];
  if (!base) {
    return {
      triggerSector,
      triggerCrashPct,
      directLoss: 0,
      contagionLoss: 0,
      totalLoss: 0,
      simpleModelLoss: 0,
      underestimation: 0,
      underestimationPct: 0,
      portfolioPctLoss: 0,
      cascade: [],
    };
  }

  let directLoss = Math.round((base.rupeeAmount * triggerCrashPct) / 100);
  let contagionLoss = 0;
  const cascade = [
    {
      sector: triggerSector,
      type: "direct",
      correlation: 1,
      crashPct: triggerCrashPct,
      lossRupees: directLoss,
    },
  ];

  for (const [sector, data] of Object.entries(sectorExposure || {})) {
    if (sector === triggerSector) continue;
    const corr = corrMap.get(`${triggerSector}|${sector}`);
    if (!corr || corr < 0.5) continue;
    const crashPct = +(triggerCrashPct * corr).toFixed(1);
    const loss = Math.round((data.rupeeAmount * crashPct) / 100);
    contagionLoss += loss;
    cascade.push({
      sector,
      type: "contagion",
      correlation: corr,
      crashPct,
      lossRupees: loss,
    });
  }

  cascade.sort((a, b) => b.lossRupees - a.lossRupees);
  const totalLoss = directLoss + contagionLoss;

  return {
    triggerSector,
    triggerCrashPct,
    directLoss,
    contagionLoss,
    totalLoss,
    simpleModelLoss: directLoss,
    underestimation: contagionLoss,
    underestimationPct: directLoss ? +((contagionLoss / directLoss) * 100).toFixed(0) : 0,
    portfolioPctLoss: totalInvested ? +((totalLoss / totalInvested) * 100).toFixed(1) : 0,
    cascade,
  };
}
