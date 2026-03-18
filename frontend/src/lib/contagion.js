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

/**
 * Find the top-3 trigger sectors that cause the highest total portfolio loss
 * when crashed at the given severity.
 */
export function findWorstTriggers(totalInvested, sectorExposure, crashPct = 30) {
  const sectors = Object.keys(sectorExposure || {});
  return sectors
    .map((sector) => {
      const result = simulateContagion(totalInvested, sectorExposure, sector, crashPct);
      return {
        sector,
        totalLoss: result.totalLoss,
        contagionLoss: result.contagionLoss,
        portfolioPctLoss: result.portfolioPctLoss,
      };
    })
    .sort((a, b) => b.totalLoss - a.totalLoss)
    .slice(0, 3);
}

const ALL_SECTORS = [
  "Banking", "IT", "Pharma", "Auto", "FMCG", "Metals", "Realty",
  "Energy", "Infrastructure", "Telecom", "Insurance", "Capital Goods",
  "Chemicals", "Media", "Other",
];

/**
 * Find sectors not currently held that have the lowest average correlation
 * with held sectors — potential diversifiers / safe havens.
 */
export function findSafeHavens(sectorExposure) {
  const heldSectors = new Set(Object.keys(sectorExposure || {}));
  const candidates = ALL_SECTORS.filter((s) => !heldSectors.has(s));
  return candidates
    .map((candidate) => {
      let totalCorr = 0;
      let count = 0;
      for (const held of heldSectors) {
        const corr =
          corrMap.get(`${candidate}|${held}`) ??
          corrMap.get(`${held}|${candidate}`) ??
          0.2;
        totalCorr += corr;
        count++;
      }
      return {
        sector: candidate,
        avgCorrelation: count > 0 ? +(totalCorr / count).toFixed(2) : 0.2,
      };
    })
    .sort((a, b) => a.avgCorrelation - b.avgCorrelation)
    .slice(0, 3);
}
