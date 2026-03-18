export function computeOverlap(fundA, fundB) {
  const holdingsA = Array.isArray(fundA?.holdings) ? fundA.holdings : [];
  const holdingsB = Array.isArray(fundB?.holdings) ? fundB.holdings : [];
  const mapB = new Map(
    holdingsB
      .filter((h) => h?.ticker)
      .map((h) => [String(h.ticker).toUpperCase(), Number(h.weight) || 0])
  );

  let overlapPct = 0;
  const sharedStocks = [];

  for (const h of holdingsA) {
    const ticker = h?.ticker ? String(h.ticker).toUpperCase() : null;
    if (!ticker || !mapB.has(ticker)) {
      continue;
    }

    const weightA = Number(h.weight) || 0;
    const weightB = mapB.get(ticker);
    overlapPct += Math.min(weightA, weightB);

    sharedStocks.push({
      ticker,
      name: h.name || ticker,
      weightA: +weightA.toFixed(3),
      weightB: +weightB.toFixed(3),
      combinedWeight: +(weightA + weightB).toFixed(3),
      sector: "N/A",
    });
  }

  sharedStocks.sort((a, b) => b.combinedWeight - a.combinedWeight);
  return {
    overlapPct: +overlapPct.toFixed(1),
    sharedStocks,
  };
}

export function analyseOverlap(portfolio) {
  const pairs = [];
  const stockMap = new Map();

  for (let i = 0; i < portfolio.length; i += 1) {
    for (let j = i + 1; j < portfolio.length; j += 1) {
      const left = portfolio[i];
      const right = portfolio[j];
      const { overlapPct, sharedStocks } = computeOverlap(left.fund, right.fund);

      pairs.push({
        fundA: left.fund.name,
        fundB: right.fund.name,
        idA: left.fund.id,
        idB: right.fund.id,
        overlapPct,
        sharedStocks,
      });

      for (const stock of sharedStocks) {
        if (!stockMap.has(stock.ticker)) {
          stockMap.set(stock.ticker, {
            ticker: stock.ticker,
            name: stock.name,
            sector: "N/A",
            appearsInFunds: new Set([left.fund.name, right.fund.name]),
            combinedWeight: stock.combinedWeight,
          });
        } else {
          const existing = stockMap.get(stock.ticker);
          existing.appearsInFunds.add(left.fund.name);
          existing.appearsInFunds.add(right.fund.name);
          existing.combinedWeight += stock.combinedWeight;
        }
      }
    }
  }

  const topSharedStocks = [...stockMap.values()]
    .filter((s) => s.appearsInFunds.size >= 2)
    .map((s) => ({
      ticker: s.ticker,
      name: s.name,
      sector: s.sector,
      funds: [...s.appearsInFunds],
      combinedWeight: +s.combinedWeight.toFixed(2),
    }))
    .sort((a, b) => b.combinedWeight - a.combinedWeight)
    .slice(0, 10);

  const averageOverlapPct = pairs.length
    ? +(pairs.reduce((sum, pair) => sum + pair.overlapPct, 0) / pairs.length).toFixed(1)
    : 0;

  return {
    pairs,
    topSharedStocks,
    averageOverlapPct,
  };
}
