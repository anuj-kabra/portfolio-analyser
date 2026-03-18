const INR = new Intl.NumberFormat("en-IN");

export function generateELI5(portfolio, overlapResult, sectorExposure) {
  const avgOverlap = overlapResult?.averageOverlapPct || 0;
  const topSectorEntry = Object.entries(sectorExposure || {})[0];
  const topSector = topSectorEntry?.[0];
  const topSectorData = topSectorEntry?.[1];
  const crashLoss = Math.round(((topSectorData?.rupeeAmount || 0) * 30) / 100);

  const fundScores = {};
  for (const pair of overlapResult?.pairs || []) {
    fundScores[pair.fundA] = (fundScores[pair.fundA] || 0) + pair.overlapPct;
    fundScores[pair.fundB] = (fundScores[pair.fundB] || 0) + pair.overlapPct;
  }
  const mostUniqueFund = Object.entries(fundScores).sort((a, b) => a[1] - b[1])[0]?.[0] || "";

  const diversification =
    avgOverlap > 40
      ? `Your portfolio has high overlap at ${avgOverlap}%. This means different fund names are still holding many of the same stocks.`
      : avgOverlap > 20
        ? `Your portfolio has moderate overlap at ${avgOverlap}%. You have some diversification, but there is still concentration hiding under the surface.`
        : `Your portfolio overlap is low at ${avgOverlap}%. Most of your funds are actually giving you differentiated exposure.`;

  const biggestRisk = topSector
    ? `Your biggest sector exposure is ${topSector} at ${topSectorData.weightPct}% (INR ${INR.format(topSectorData.rupeeAmount)}). A 30% drop in this sector could cost around INR ${INR.format(crashLoss)}.`
    : "Sector concentration could not be computed right now, but the overall overlap still gives a strong diversification signal.";

  const goodNews = mostUniqueFund
    ? `${mostUniqueFund} is currently your most unique fund and contributes most to diversification in your current basket.`
    : "A fund from a different category can improve diversification if your portfolio currently feels too clustered.";

  return { diversification, biggestRisk, goodNews };
}
