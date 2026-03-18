export function computeSectorExposure(portfolio) {
  const totalInvested = portfolio.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  const sectorTotals = {};

  if (!totalInvested) {
    return {};
  }

  for (const item of portfolio) {
    const amount = Number(item?.amount) || 0;
    if (!amount || !item?.fund?.sectorWeights) {
      continue;
    }

    const portfolioWeight = amount / totalInvested;
    for (const [sector, sectorPct] of Object.entries(item.fund.sectorWeights)) {
      const numericSectorPct = Number(sectorPct) || 0;
      sectorTotals[sector] = (sectorTotals[sector] || 0) + numericSectorPct * portfolioWeight;
    }
  }

  const exposure = {};
  for (const [sector, weightPctRaw] of Object.entries(sectorTotals)) {
    const weightPct = +weightPctRaw.toFixed(1);
    if (weightPct <= 0) {
      continue;
    }
    exposure[sector] = {
      weightPct,
      rupeeAmount: Math.round((totalInvested * weightPct) / 100),
    };
  }

  return Object.fromEntries(
    Object.entries(exposure).sort((a, b) => b[1].weightPct - a[1].weightPct)
  );
}

export function simulateCrash(totalInvested, sectorExposure, sector, crashPct) {
  const amount = Number(totalInvested) || 0;
  const crash = Number(crashPct) || 0;
  const sectorData = sectorExposure?.[sector];

  if (!amount || !sectorData) {
    return { rupeeLoss: 0, portfolioPctLoss: 0 };
  }

  const rupeeLoss = Math.round((sectorData.rupeeAmount * crash) / 100);
  const portfolioPctLoss = +((rupeeLoss / amount) * 100).toFixed(1);

  return { rupeeLoss, portfolioPctLoss };
}
