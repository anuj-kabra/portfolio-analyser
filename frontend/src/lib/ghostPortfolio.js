const INR = new Intl.NumberFormat("en-IN");

function fmt(amount) {
  return `INR ${INR.format(amount)}`;
}

export function buildGhostPortfolio(portfolio) {
  const totalInvested = portfolio.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  if (!totalInvested) {
    return {
      holdings: [],
      top20: [],
      totalStocks: 0,
      uniqueStocks: 0,
      redundantStocks: 0,
      tripleHeld: 0,
      hhi: 0,
      effectiveTER: 0,
      annualFeeRupees: 0,
      indexFundFee: 0,
      excessFee: 0,
      top10Weight: 0,
      totalInvested: 0,
      fundTERs: [],
    };
  }

  const stockMap = new Map();
  for (const { fund, amount } of portfolio) {
    const fundWeight = amount / totalInvested;
    for (const h of fund?.holdings || []) {
      const ticker = String(h?.ticker || "").toUpperCase();
      if (!ticker) continue;
      const effectiveWeight = (Number(h?.weight) || 0) * fundWeight;
      if (!stockMap.has(ticker)) {
        stockMap.set(ticker, {
          ticker,
          name: h?.name || ticker,
          effectiveWeight,
          investedAmount: Math.round((totalInvested * effectiveWeight) / 100),
          heldBy: new Set([fund.name]),
        });
      } else {
        const existing = stockMap.get(ticker);
        existing.effectiveWeight += effectiveWeight;
        existing.investedAmount = Math.round((totalInvested * existing.effectiveWeight) / 100);
        existing.heldBy.add(fund.name);
      }
    }
  }

  const holdings = [...stockMap.values()]
    .map((h) => ({
      ...h,
      effectiveWeight: +h.effectiveWeight.toFixed(2),
      heldBy: [...h.heldBy],
    }))
    .sort((a, b) => b.effectiveWeight - a.effectiveWeight);

  const hhi = Math.round(holdings.reduce((sum, h) => sum + Math.pow(h.effectiveWeight, 2), 0));
  const totalStocks = holdings.length;
  const uniqueStocks = holdings.filter((h) => h.heldBy.length === 1).length;
  const redundantStocks = holdings.filter((h) => h.heldBy.length >= 2).length;
  const tripleHeld = holdings.filter((h) => h.heldBy.length >= 3).length;
  const top20 = holdings.slice(0, 20);
  const top10Weight = +holdings.slice(0, 10).reduce((sum, h) => sum + h.effectiveWeight, 0).toFixed(1);

  const effectiveTER = portfolio.reduce(
    (sum, item) => sum + ((Number(item?.fund?.ter) || 0.6) * item.amount) / totalInvested,
    0
  );
  const annualFeeRupees = Math.round((totalInvested * effectiveTER) / 100);
  const indexFundFee = Math.round((totalInvested * 0.1) / 100);
  const excessFee = Math.max(annualFeeRupees - indexFundFee, 0);

  const fundTERs = portfolio.map((item) => {
    const ter = Number(item?.fund?.ter) || 0.6;
    const amount = Number(item?.amount) || 0;
    return {
      name: item?.fund?.name || "Unknown",
      ter: +ter.toFixed(2),
      annualCost: Math.round((amount * ter) / 100),
    };
  });

  return {
    holdings,
    top20,
    totalStocks,
    uniqueStocks,
    redundantStocks,
    tripleHeld,
    hhi,
    effectiveTER: +effectiveTER.toFixed(2),
    annualFeeRupees,
    indexFundFee,
    excessFee,
    top10Weight,
    totalInvested,
    fundTERs,
  };
}

export function ghostSummaryText(ghost) {
  const concentration =
    ghost.hhi > 2500
      ? "highly concentrated"
      : ghost.hhi > 1000
        ? "moderately concentrated"
        : "well diversified";

  return {
    line1: `Across your funds, you effectively hold ${ghost.totalStocks} stocks. ${ghost.redundantStocks} appear in multiple funds.`,
    line2: `Top 10 holdings make up ${ghost.top10Weight}% of your portfolio. Concentration is ${concentration}.`,
    line3:
      ghost.excessFee > 0
        ? `You are paying ${fmt(ghost.annualFeeRupees)} yearly in fund fees vs ${fmt(ghost.indexFundFee)} for a low-cost index proxy.`
        : "Your current fee load is already efficient for this portfolio size.",
  };
}
