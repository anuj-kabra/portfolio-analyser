# Technical Requirements Document — V2.2
## MF Portfolio Analyzer — Deepening the Five Features

**Version:** 2.2  
**Date:** March 18, 2026  
**Builds on:** TRD v2.1 (all 5 deep analysis features working)  
**Estimated additional build time:** 6–8 hours  

---

## 1. File Changes Summary

```
frontend/src/
├── data/
│   ├── niftyBenchmark.js          # NEW — Nifty 50 sector weights + top stocks
│   ├── sectorBetas.js             # NEW — sector beta multipliers vs Nifty
│   ├── crashRecovery.js           # NEW — per-sector recovery months per event
│   ├── historicalCrashes.js       # UNCHANGED
│   ├── sectorCorrelations.js      # UNCHANGED
│   └── sectorVolatility.js        # UNCHANGED
├── lib/
│   ├── ghostPortfolio.js          # MODIFIED — add stockStressTest, niftyComparison, fundContribution, capBreakdown
│   ├── crashReplay.js             # MODIFIED — add recoveryTimeline, perFundAttribution, vsNifty
│   ├── contagion.js               # MODIFIED — add worstTrigger, safeHavens
│   ├── fundSwap.js                # MODIFIED — add rebalanceMode, fitmentCheck, amountOptimizer
│   └── rupeeAtRisk.js             # MODIFIED — add panicMode, sipMonthsLost, riskBudget
├── components/
│   ├── GhostPortfolio.jsx         # MODIFIED — add 4 sub-sections
│   ├── CrashReplay.jsx            # MODIFIED — add 3 sub-sections
│   ├── ContagionMap.jsx           # MODIFIED — add 3 sub-sections
│   ├── FundSwapLab.jsx            # MODIFIED — add 3 modes
│   └── RupeeAtRisk.jsx            # MODIFIED — add 3 sub-sections
└── App.jsx                        # MODIFIED — pass new computed data as props
```

**No new components. No new lib files. All changes are additions within existing files.**

---

## 2. New Data Files

### 2.1 niftyBenchmark.js

```javascript
// src/data/niftyBenchmark.js
// Nifty 50 sector weights and top-10 stock weights
// Source: NSE India Nifty 50 factsheet (latest available)
// This is static reference data for comparison purposes.

export const NIFTY_50 = {
  totalStocks: 50,
  hhi: 682,
  indexFundTER: 0.10, // Typical Nifty 50 direct plan TER

  sectorWeights: {
    'Financial Services': 31.2,
    'IT': 13.8,
    'Energy': 12.4,
    'FMCG': 8.6,
    'Auto': 7.2,
    'Healthcare': 4.1,
    'Pharma': 3.8,
    'Metals': 3.5,
    'Telecom': 3.2,
    'Capital Goods': 3.0,
    'Consumer Durables': 2.8,
    'Realty': 1.4,
    'Infrastructure': 1.2,
    'Banking': 0, // Banking is classified under Financial Services in Nifty
    'Others': 3.8,
  },

  topStocks: [
    { name: 'HDFC Bank', weight: 7.2 },
    { name: 'Reliance Industries', weight: 6.8 },
    { name: 'ICICI Bank', weight: 5.9 },
    { name: 'Infosys', weight: 5.4 },
    { name: 'ITC', weight: 4.1 },
    { name: 'TCS', weight: 3.8 },
    { name: 'Bharti Airtel', weight: 3.2 },
    { name: 'L&T', weight: 3.0 },
    { name: 'SBI', weight: 2.8 },
    { name: 'Axis Bank', weight: 2.6 },
  ],

  topStockWeight: 7.2, // HDFC Bank
  maxSectorPct: 31.2,  // Financial Services
};
```

### 2.2 sectorBetas.js

```javascript
// src/data/sectorBetas.js
// Beta = how much a sector moves relative to Nifty 50
// Beta 1.3 means if Nifty drops 1%, this sector drops ~1.3%
// Derived from 5-year daily returns regression vs Nifty 50

export const SECTOR_BETAS = {
  'Banking': 1.32,
  'IT': 0.91,
  'Pharma': 0.62,
  'Auto': 1.18,
  'FMCG': 0.58,
  'Metals': 1.45,
  'Realty': 1.52,
  'Energy': 1.08,
  'Infrastructure': 1.25,
  'Telecom': 0.78,
  'Media': 1.15,
  'Financial Services': 1.28,
  'Consumer Durables': 0.95,
  'Chemicals': 1.05,
  'Healthcare': 0.65,
  'Textiles': 1.12,
  'Capital Goods': 1.22,
  'Insurance': 1.10,
  'NBFC': 1.38,
};

export const DEFAULT_BETA = 1.0;
```

### 2.3 crashRecovery.js

```javascript
// src/data/crashRecovery.js
// Months to recover to pre-crash levels, per sector, per event
// Source: NSE sector index data — months from trough to previous peak

export const CRASH_RECOVERY = {
  'covid-2020': {
    'Banking': 11, 'IT': 7, 'Pharma': 4, 'Auto': 13, 'FMCG': 6,
    'Metals': 10, 'Realty': 18, 'Energy': 12, 'Infrastructure': 14,
    'Telecom': 8, 'Media': 16, 'Financial Services': 11, 'Consumer Durables': 9,
    'Chemicals': 8, 'Healthcare': 5, 'Textiles': 15, 'Capital Goods': 13,
    'Insurance': 12, 'NBFC': 16,
  },
  'ilfs-2018': {
    'Banking': 8, 'IT': 3, 'Pharma': 5, 'Auto': 14, 'FMCG': 4,
    'Metals': 9, 'Realty': 20, 'Energy': 7, 'Infrastructure': 11,
    'Telecom': 6, 'Media': 15, 'Financial Services': 10, 'Consumer Durables': 8,
    'Chemicals': 6, 'Healthcare': 4, 'Textiles': 12, 'Capital Goods': 10,
    'Insurance': 9, 'NBFC': 22,
  },
  'demonetization-2016': {
    'Banking': 5, 'IT': 3, 'Pharma': 4, 'Auto': 7, 'FMCG': 4,
    'Metals': 4, 'Realty': 14, 'Energy': 5, 'Infrastructure': 6,
    'Telecom': 3, 'Media': 8, 'Financial Services': 6, 'Consumer Durables': 9,
    'Chemicals': 4, 'Healthcare': 3, 'Textiles': 8, 'Capital Goods': 6,
    'Insurance': 5, 'NBFC': 10,
  },
  'china-2015': {
    'Banking': 6, 'IT': 4, 'Pharma': 3, 'Auto': 7, 'FMCG': 3,
    'Metals': 12, 'Realty': 10, 'Energy': 9, 'Infrastructure': 8,
    'Telecom': 4, 'Media': 7, 'Financial Services': 7, 'Consumer Durables': 5,
    'Chemicals': 6, 'Healthcare': 3, 'Textiles': 7, 'Capital Goods': 8,
    'Insurance': 5, 'NBFC': 9,
  },
  'global-2008': {
    'Banking': 22, 'IT': 18, 'Pharma': 10, 'Auto': 20, 'FMCG': 8,
    'Metals': 28, 'Realty': 48, 'Energy': 24, 'Infrastructure': 30,
    'Telecom': 16, 'Media': 24, 'Financial Services': 23, 'Consumer Durables': 18,
    'Chemicals': 15, 'Healthcare': 11, 'Textiles': 22, 'Capital Goods': 26,
    'Insurance': 20, 'NBFC': 32,
  },
};
```

---

## 3. Library Additions

### 3.1 ghostPortfolio.js — new functions

Add these functions to the existing `ghostPortfolio.js`:

```javascript
// ── Addition: Single-stock stress test ──────────────────────────────────────
export function stockStressTest(ghost, stockIndex, crashPct) {
  const stock = ghost.top20[stockIndex];
  if (!stock) return null;
  const rupeeLoss = Math.round(ghost.totalInvested * stock.effectiveWeight * crashPct / 10000);
  return {
    stock,
    crashPct,
    rupeeLoss,
    isInAllFunds: stock.heldBy.length >= 3,
    fundsHolding: stock.heldBy.length,
  };
}

// ── Addition: Nifty 50 shadow comparison ────────────────────────────────────
import { NIFTY_50 } from '../data/niftyBenchmark';

export function compareWithNifty(ghost) {
  const niftyFeeOnSameAmount = Math.round(ghost.totalInvested * NIFTY_50.indexFundTER / 100);
  return {
    ghost: {
      stocks: ghost.totalStocks,
      hhi: ghost.hhi,
      topStockWeight: ghost.top20[0]?.effectiveWeight?.toFixed(1) ?? 0,
      topStockName: ghost.top20[0]?.name ?? '',
      fee: ghost.annualFeeRupees,
      ter: ghost.effectiveTER,
    },
    nifty: {
      stocks: NIFTY_50.totalStocks,
      hhi: NIFTY_50.hhi,
      topStockWeight: NIFTY_50.topStockWeight,
      topStockName: NIFTY_50.topStocks[0].name,
      fee: niftyFeeOnSameAmount,
      ter: NIFTY_50.indexFundTER,
    },
    moreConcentrated: ghost.hhi > NIFTY_50.hhi,
    feeMultiple: ghost.annualFeeRupees > 0
      ? +(ghost.annualFeeRupees / niftyFeeOnSameAmount).toFixed(1)
      : 0,
  };
}

// ── Addition: Fund contribution score ───────────────────────────────────────
export function computeFundContributions(portfolio, ghost) {
  const contributions = [];

  for (const { fund, amount } of portfolio) {
    // Count unique stocks: only in this fund, not in any other
    const otherISINs = new Set();
    for (const other of portfolio) {
      if (other.fund.schemeCode === fund.schemeCode) continue;
      for (const h of other.fund.holdings) {
        otherISINs.add(h.isin);
      }
    }
    const uniqueStocks = fund.holdings.filter(h => !otherISINs.has(h.isin));
    const uniqueStockCount = uniqueStocks.length;
    const uniqueWeight = uniqueStocks.reduce((s, h) => s + h.weight, 0);

    contributions.push({
      fundName: fund.name,
      schemeCode: fund.schemeCode,
      amount,
      uniqueStockCount,
      totalStockCount: fund.holdings.length,
      uniqueWeight: +uniqueWeight.toFixed(1),
      annualFee: Math.round(amount * (fund.ter ?? 0.5) / 100),
    });
  }

  // Compute contribution percentage based on unique stock counts
  const totalUnique = contributions.reduce((s, c) => s + c.uniqueStockCount, 0);
  for (const c of contributions) {
    c.contributionPct = totalUnique > 0
      ? Math.round((c.uniqueStockCount / totalUnique) * 100)
      : 0;
  }

  contributions.sort((a, b) => b.contributionPct - a.contributionPct);
  return contributions;
}

// ── Addition: Market-cap breakdown ──────────────────────────────────────────
// Simplified: use fund category as proxy for market cap of holdings
const CAP_MAP = {
  'Large Cap': 'large', 'Bluechip': 'large',
  'Mid Cap': 'mid', 'Mid-Cap': 'mid',
  'Small Cap': 'small', 'Small-Cap': 'small',
};

// Flexi Cap approximate splits (from factsheets)
const FLEXI_SPLITS = { large: 0.65, mid: 0.20, small: 0.15 };

export function computeCapBreakdown(portfolio) {
  const totalInvested = portfolio.reduce((s, p) => s + p.amount, 0);
  let large = 0, mid = 0, small = 0;

  for (const { fund, amount } of portfolio) {
    const weight = amount / totalInvested;
    const cat = fund.category;
    if (cat.includes('Large') || cat.includes('Bluechip')) {
      large += weight;
    } else if (cat.includes('Mid')) {
      mid += weight;
    } else if (cat.includes('Small')) {
      small += weight;
    } else {
      // Flexi Cap, Multi Cap, etc. — use approximate splits
      large += weight * FLEXI_SPLITS.large;
      mid += weight * FLEXI_SPLITS.mid;
      small += weight * FLEXI_SPLITS.small;
    }
  }

  return {
    large: Math.round(large * 100),
    mid: Math.round(mid * 100),
    small: Math.round(small * 100),
  };
}
```

### 3.2 crashReplay.js — new functions

Add to existing `crashReplay.js`:

```javascript
import { CRASH_RECOVERY } from '../data/crashRecovery';

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

// ── Addition: Recovery timeline ─────────────────────────────────────────────
export function computeRecoveryTimeline(sectorExposure, crashEventId) {
  const recoveryData = CRASH_RECOVERY[crashEventId];
  if (!recoveryData) return null;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [sector, data] of Object.entries(sectorExposure)) {
    const months = recoveryData[sector];
    if (months === undefined) continue;
    const weight = data.weightPct;
    weightedSum += weight * months;
    totalWeight += weight;
  }

  const recoveryMonths = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  return { recoveryMonths, crashEventId };
}

// ── Addition: Per-fund loss attribution ─────────────────────────────────────
export function computePerFundLoss(portfolio, crashEvent) {
  const fundLosses = [];

  for (const { fund, amount } of portfolio) {
    let fundLoss = 0;
    let worstSector = '';
    let worstSectorDrop = 0;

    for (const [sector, drawdown] of Object.entries(crashEvent.sectorDrawdowns)) {
      const sectorWeight = fund.sectorWeights?.[sector] ?? 0;
      const loss = (sectorWeight / 100) * amount * (Math.abs(drawdown) / 100);
      fundLoss += loss;

      if (Math.abs(drawdown) > Math.abs(worstSectorDrop) && sectorWeight > 3) {
        worstSectorDrop = drawdown;
        worstSector = sector;
      }
    }

    fundLosses.push({
      fundName: fund.name,
      shortName: fund.name.split(' - ')[0].split(' Fund')[0],
      amount,
      loss: Math.round(fundLoss),
      lossPct: +((fundLoss / amount) * 100).toFixed(1),
      worstSector,
      worstSectorDrop,
    });
  }

  fundLosses.sort((a, b) => b.loss - a.loss);
  return fundLosses;
}

// ── Addition: Portfolio vs Nifty comparison ──────────────────────────────────
export function portfolioVsNifty(portfolioLossPct, niftyDrawdown) {
  const diff = +(portfolioLossPct - Math.abs(niftyDrawdown)).toFixed(1);
  return {
    portfolioLossPct,
    niftyLossPct: Math.abs(niftyDrawdown),
    diff: Math.abs(diff),
    worse: diff > 0,
    label: diff > 0
      ? `${Math.abs(diff)} percentage points worse than the market`
      : `${Math.abs(diff)} percentage points better than the market`,
  };
}
```

### 3.3 contagion.js — new functions

Add to existing `contagion.js`:

```javascript
// ── Addition: Worst trigger auto-detection ──────────────────────────────────
export function findWorstTriggers(totalInvested, sectorExposure, crashPct = 30) {
  const results = [];

  for (const sector of Object.keys(sectorExposure)) {
    if (sectorExposure[sector].weightPct < 3) continue; // skip tiny exposures
    const result = simulateContagion(totalInvested, sectorExposure, sector, crashPct);
    results.push({
      sector,
      totalLoss: result.totalLoss,
      cascadeCount: result.cascade.filter(c => c.type === 'contagion').length,
      portfolioPctLoss: result.portfolioPctLoss,
    });
  }

  results.sort((a, b) => b.totalLoss - a.totalLoss);
  return results.slice(0, 5); // top 5 worst triggers
}

// ── Addition: Safe-haven sectors ────────────────────────────────────────────
export function findSafeHavens(sectorExposure, contagionResult) {
  const affectedSectors = new Set(contagionResult.cascade.map(c => c.sector));
  const safeHavens = [];

  for (const [sector, data] of Object.entries(sectorExposure)) {
    if (!affectedSectors.has(sector) && data.weightPct > 1) {
      safeHavens.push({
        sector,
        rupeeAmount: data.rupeeAmount,
        weightPct: data.weightPct,
      });
    }
  }

  safeHavens.sort((a, b) => b.rupeeAmount - a.rupeeAmount);
  const totalProtected = safeHavens.reduce((s, h) => s + h.rupeeAmount, 0);
  return { safeHavens, totalProtected };
}
```

### 3.4 fundSwap.js — new functions

Add to existing `fundSwap.js`:

```javascript
// ── Addition: Rebalance mode ────────────────────────────────────────────────
export function simulateRebalance(currentPortfolio, newAmounts, allFunds) {
  // newAmounts is an array of numbers matching portfolio order
  const rebalancedPortfolio = currentPortfolio.map((entry, i) => ({
    fund: entry.fund,
    amount: newAmounts[i],
  }));

  const beforeOverlap = analyseOverlap(currentPortfolio);
  const afterOverlap = analyseOverlap(rebalancedPortfolio);
  const beforeSector = computeSectorExposure(currentPortfolio);
  const afterSector = computeSectorExposure(rebalancedPortfolio);

  const topSectorBefore = Object.entries(beforeSector)[0];
  const topSectorAfter = Object.entries(afterSector)[0];

  return {
    before: {
      avgOverlap: beforeOverlap.averageOverlapPct,
      topSector: topSectorBefore[0],
      topSectorPct: topSectorBefore[1].weightPct,
    },
    after: {
      avgOverlap: afterOverlap.averageOverlapPct,
      topSector: topSectorAfter[0],
      topSectorPct: topSectorAfter[1].weightPct,
    },
    delta: {
      overlapChange: +(afterOverlap.averageOverlapPct - beforeOverlap.averageOverlapPct).toFixed(1),
      topSectorChange: +(topSectorAfter[1].weightPct - topSectorBefore[1].weightPct).toFixed(1),
    },
    rebalancedPortfolio,
  };
}

// ── Addition: Amount optimizer ──────────────────────────────────────────────
export function optimizeAmounts(currentPortfolio) {
  const totalInvested = currentPortfolio.reduce((s, p) => s + p.amount, 0);
  const n = currentPortfolio.length;
  const step = 10000; // ₹10,000 steps
  const minPerFund = 50000; // minimum ₹50,000 per fund

  let bestScore = Infinity;
  let bestAmounts = currentPortfolio.map(p => p.amount);

  // Generate combinations using recursive approach for n funds
  function generate(remaining, index, amounts) {
    if (index === n - 1) {
      if (remaining >= minPerFund) {
        amounts[index] = remaining;
        // Score this combination
        const testPortfolio = currentPortfolio.map((p, i) => ({ fund: p.fund, amount: amounts[i] }));
        const overlap = analyseOverlap(testPortfolio);
        const sectors = computeSectorExposure(testPortfolio);
        const maxSector = Object.values(sectors)[0]?.weightPct ?? 0;
        const score = overlap.averageOverlapPct * 0.6 + maxSector * 0.4;
        if (score < bestScore) {
          bestScore = score;
          bestAmounts = [...amounts];
        }
      }
      return;
    }
    for (let amt = minPerFund; amt <= remaining - (n - index - 1) * minPerFund; amt += step) {
      amounts[index] = amt;
      generate(remaining - amt, index + 1, amounts);
    }
  }

  generate(totalInvested, 0, new Array(n));

  return {
    optimizedAmounts: bestAmounts,
    currentAmounts: currentPortfolio.map(p => p.amount),
    totalInvested,
  };
}

// ── Addition: Fitment check ─────────────────────────────────────────────────
export function checkFitment(currentPortfolio, newFund, newAmount) {
  const extendedPortfolio = [...currentPortfolio, { fund: newFund, amount: newAmount }];

  const beforeOverlap = analyseOverlap(currentPortfolio);
  const afterOverlap = analyseOverlap(extendedPortfolio);
  const beforeSector = computeSectorExposure(currentPortfolio);
  const afterSector = computeSectorExposure(extendedPortfolio);

  const totalBefore = currentPortfolio.reduce((s, p) => s + p.amount, 0);
  const totalAfter = totalBefore + newAmount;

  // Compute overlap of new fund with existing portfolio
  let maxOverlapWithExisting = 0;
  for (const existing of currentPortfolio) {
    const { overlapPct } = computeOverlap(existing.fund, newFund);
    if (overlapPct > maxOverlapWithExisting) maxOverlapWithExisting = overlapPct;
  }

  // Count new sectors the fund brings
  const existingSectors = new Set();
  for (const { fund } of currentPortfolio) {
    for (const [sector, weight] of Object.entries(fund.sectorWeights)) {
      if (weight > 5) existingSectors.add(sector);
    }
  }
  const newSectors = [];
  for (const [sector, weight] of Object.entries(newFund.sectorWeights)) {
    if (weight > 5 && !existingSectors.has(sector)) {
      newSectors.push(sector);
    }
  }

  // Count unique stocks this fund brings
  const existingISINs = new Set();
  for (const { fund } of currentPortfolio) {
    for (const h of fund.holdings) existingISINs.add(h.isin);
  }
  const uniqueNewStocks = newFund.holdings.filter(h => !existingISINs.has(h.isin)).length;

  // Verdict
  let verdict, verdictColor;
  if (maxOverlapWithExisting < 20 && newSectors.length >= 2) {
    verdict = 'This fund adds genuine diversification. It brings ' +
      uniqueNewStocks + ' stocks you don\'t currently hold and adds exposure to ' +
      newSectors.join(' and ') + '.';
    verdictColor = 'green';
  } else if (maxOverlapWithExisting < 40 || newSectors.length >= 1) {
    verdict = 'This fund partially overlaps with your portfolio. It adds some new exposure ' +
      (newSectors.length > 0 ? 'to ' + newSectors.join(', ') : '') +
      ' but ' + Math.round(maxOverlapWithExisting) + '% of its top holdings are already in your portfolio.';
    verdictColor = 'amber';
  } else {
    verdict = 'This fund duplicates what you already own. ' +
      Math.round(maxOverlapWithExisting) + '% of its holdings overlap with your existing portfolio. ' +
      'Adding it would increase concentration, not diversification.';
    verdictColor = 'red';
  }

  return {
    before: {
      avgOverlap: beforeOverlap.averageOverlapPct,
      topSector: Object.entries(beforeSector)[0],
      totalInvested: totalBefore,
    },
    after: {
      avgOverlap: afterOverlap.averageOverlapPct,
      topSector: Object.entries(afterSector)[0],
      totalInvested: totalAfter,
    },
    delta: {
      overlapChange: +(afterOverlap.averageOverlapPct - beforeOverlap.averageOverlapPct).toFixed(1),
    },
    maxOverlapWithExisting: +maxOverlapWithExisting.toFixed(1),
    newSectors,
    uniqueNewStocks,
    verdict,
    verdictColor,
  };
}
```

### 3.5 rupeeAtRisk.js — new functions

Add to existing `rupeeAtRisk.js`:

```javascript
import { SECTOR_BETAS, DEFAULT_BETA } from '../data/sectorBetas';

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

// ── Addition: Panic mode ────────────────────────────────────────────────────
export function panicModeCalc(niftyDropPct, sectorExposure, totalInvested, var95Rupees) {
  const sectorLosses = [];
  let totalLoss = 0;

  for (const [sector, data] of Object.entries(sectorExposure)) {
    const beta = SECTOR_BETAS[sector] ?? DEFAULT_BETA;
    const sectorDrop = niftyDropPct * beta;
    const loss = Math.round(data.rupeeAmount * sectorDrop / 100);
    totalLoss += loss;
    sectorLosses.push({
      sector,
      beta,
      sectorDrop: +sectorDrop.toFixed(1),
      loss,
    });
  }

  sectorLosses.sort((a, b) => b.loss - a.loss);

  const pctOfVar = var95Rupees > 0 ? Math.round((totalLoss / var95Rupees) * 100) : 0;
  let severity, severityColor;
  if (pctOfVar < 30) {
    severity = 'Normal market volatility. Don\'t worry.';
    severityColor = 'green';
  } else if (pctOfVar < 60) {
    severity = 'A rough day, but within expected range.';
    severityColor = 'amber';
  } else {
    severity = 'A significant drop. Check if your diversification is working.';
    severityColor = 'red';
  }

  return {
    niftyDropPct,
    totalLoss,
    pctOfVar,
    severity,
    severityColor,
    topSectorLosses: sectorLosses.slice(0, 3),
  };
}

// ── Addition: SIP months lost ───────────────────────────────────────────────
export function sipMonthsLost(var95Rupees, monthlySIP) {
  if (!monthlySIP || monthlySIP <= 0) return null;
  const months = +(var95Rupees / monthlySIP).toFixed(1);
  return {
    months,
    var95Rupees,
    monthlySIP,
  };
}

// ── Addition: Risk budget per fund ──────────────────────────────────────────
export function computeRiskBudget(portfolio, sectorExposure, fullVarResult) {
  const totalInvested = portfolio.reduce((s, p) => s + p.amount, 0);
  const fullVar = fullVarResult.var95.rupees;
  const budgets = [];

  for (let i = 0; i < portfolio.length; i++) {
    // Portfolio without this fund
    const reduced = portfolio.filter((_, idx) => idx !== i);
    if (reduced.length < 2) {
      // Can't compute VaR for < 2 funds meaningfully
      budgets.push({
        fundName: portfolio[i].fund.name,
        shortName: portfolio[i].fund.name.split(' - ')[0].split(' Fund')[0],
        amount: portfolio[i].amount,
        investmentPct: Math.round((portfolio[i].amount / totalInvested) * 100),
        riskContribution: Math.round(100 / portfolio.length), // fallback: equal
        riskPct: Math.round(100 / portfolio.length),
        verdict: 'proportionate',
      });
      continue;
    }

    const reducedSector = computeSectorExposure(reduced);
    const reducedTotal = reduced.reduce((s, p) => s + p.amount, 0);
    const reducedVar = computeRupeeAtRisk(reducedTotal, reducedSector);

    // This fund's marginal risk contribution
    // Scale reduced VaR to same total for apples-to-apples comparison
    const scaledReducedVar = Math.round(reducedVar.var95.rupees * (totalInvested / reducedTotal));
    const marginalRisk = Math.max(0, fullVar - scaledReducedVar);

    budgets.push({
      fundName: portfolio[i].fund.name,
      shortName: portfolio[i].fund.name.split(' - ')[0].split(' Fund')[0],
      amount: portfolio[i].amount,
      investmentPct: Math.round((portfolio[i].amount / totalInvested) * 100),
      riskContribution: marginalRisk,
      riskPct: 0, // computed after all funds
      verdict: '', // computed after
    });
  }

  // Normalize risk percentages
  const totalMarginal = budgets.reduce((s, b) => s + b.riskContribution, 0);
  for (const b of budgets) {
    b.riskPct = totalMarginal > 0 ? Math.round((b.riskContribution / totalMarginal) * 100) : 0;
    const diff = b.riskPct - b.investmentPct;
    if (diff > 10) b.verdict = 'disproportionate';
    else if (diff < -10) b.verdict = 'efficient';
    else b.verdict = 'proportionate';
  }

  budgets.sort((a, b) => b.riskPct - a.riskPct);
  return budgets;
}
```

---

## 4. Component Updates

### 4.1 GhostPortfolio.jsx — additions

Add these sections below the existing content within the component. Keep all existing UI unchanged.

```jsx
// Add after the existing ELI5 summary, still inside the GhostPortfolio component

// ── Imports at top of file ──
import { stockStressTest, compareWithNifty, computeFundContributions, computeCapBreakdown } from '../lib/ghostPortfolio';

// ── Inside the component, after existing content ──

{/* Single-stock stress test */}
<div className="space-y-3">
  <h3 className="text-sm font-medium text-gray-700">Single-stock stress test</h3>
  <div className="flex flex-wrap items-center gap-3">
    <select
      value={stressStockIdx}
      onChange={e => setStressStockIdx(+e.target.value)}
      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
    >
      {ghost.top20.slice(0, 10).map((s, i) => (
        <option key={s.isin} value={i}>{s.name} ({s.effectiveWeight.toFixed(1)}%)</option>
      ))}
    </select>
    <span className="text-sm text-gray-500">drops</span>
    <input type="range" min="10" max="50" step="5" value={stressPct}
      onChange={e => setStressPct(+e.target.value)} className="w-28" />
    <span className="text-sm font-medium text-gray-900">{stressPct}%</span>
  </div>
  {stressResult && (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <span className="text-lg font-medium text-red-700">−{fmt(stressResult.rupeeLoss)}</span>
      <span className="text-sm text-red-600 ml-2">
        — this stock is in {stressResult.fundsHolding} of your funds
        {stressResult.isInAllFunds ? ' — you cannot escape this loss without reducing overlap' : ''}
      </span>
    </div>
  )}
</div>

{/* Market-cap breakdown */}
{capBreakdown && (
  <div>
    <h3 className="text-sm font-medium text-gray-700 mb-2">Market-cap split</h3>
    <div className="h-4 rounded-full overflow-hidden flex">
      <div className="bg-blue-400" style={{width: `${capBreakdown.large}%`}} title={`Large: ${capBreakdown.large}%`} />
      <div className="bg-amber-400" style={{width: `${capBreakdown.mid}%`}} title={`Mid: ${capBreakdown.mid}%`} />
      <div className="bg-purple-400" style={{width: `${capBreakdown.small}%`}} title={`Small: ${capBreakdown.small}%`} />
    </div>
    <div className="flex gap-4 mt-2 text-xs text-gray-500">
      <span><span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-1" />Large {capBreakdown.large}%</span>
      <span><span className="inline-block w-2 h-2 bg-amber-400 rounded-full mr-1" />Mid {capBreakdown.mid}%</span>
      <span><span className="inline-block w-2 h-2 bg-purple-400 rounded-full mr-1" />Small {capBreakdown.small}%</span>
    </div>
  </div>
)}

{/* Nifty 50 comparison */}
{niftyComp && (
  <div>
    <h3 className="text-sm font-medium text-gray-700 mb-3">Your portfolio vs a single Nifty 50 index fund</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-gray-100">
          <th className="text-left py-2 text-gray-500 font-medium">Metric</th>
          <th className="text-right py-2 text-gray-500 font-medium">Your portfolio</th>
          <th className="text-right py-2 text-gray-500 font-medium">Nifty 50</th>
        </tr></thead>
        <tbody>
          <tr className="border-b border-gray-50">
            <td className="py-2 text-gray-600">Stocks</td>
            <td className="py-2 text-right">{niftyComp.ghost.stocks}</td>
            <td className="py-2 text-right">{niftyComp.nifty.stocks}</td>
          </tr>
          <tr className="border-b border-gray-50">
            <td className="py-2 text-gray-600">Concentration (HHI)</td>
            <td className={`py-2 text-right ${niftyComp.moreConcentrated ? 'text-red-600' : 'text-green-600'}`}>{niftyComp.ghost.hhi}</td>
            <td className="py-2 text-right text-gray-700">{niftyComp.nifty.hhi}</td>
          </tr>
          <tr className="border-b border-gray-50">
            <td className="py-2 text-gray-600">Top stock</td>
            <td className="py-2 text-right">{niftyComp.ghost.topStockWeight}%</td>
            <td className="py-2 text-right">{niftyComp.nifty.topStockWeight}%</td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">Annual fee</td>
            <td className={`py-2 text-right ${niftyComp.feeMultiple > 3 ? 'text-red-600 font-medium' : ''}`}>{fmt(niftyComp.ghost.fee)}</td>
            <td className="py-2 text-right text-green-600">{fmt(niftyComp.nifty.fee)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    {niftyComp.moreConcentrated && niftyComp.feeMultiple > 2 && (
      <p className="text-sm text-red-600 mt-3">
        Your portfolio is more concentrated and {niftyComp.feeMultiple}x more expensive than a single index fund.
      </p>
    )}
  </div>
)}

{/* Fund contribution */}
{fundContribs && (
  <div>
    <h3 className="text-sm font-medium text-gray-700 mb-3">Which fund is earning its keep?</h3>
    <div className="space-y-2">
      {fundContribs.map(c => (
        <div key={c.schemeCode} className="flex items-center text-sm">
          <span className="w-44 text-gray-700 truncate">{c.shortName ?? c.fundName.split(' - ')[0]}</span>
          <div className="flex-1 mx-3 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${c.contributionPct > 30 ? 'bg-green-400' : c.contributionPct > 15 ? 'bg-amber-300' : 'bg-red-300'}`}
              style={{width: `${Math.max(c.contributionPct, 3)}%`}} />
          </div>
          <span className="w-10 text-right font-medium text-gray-900">{c.contributionPct}%</span>
          <span className="w-24 text-right text-gray-400 text-xs">{c.uniqueStockCount} unique · {fmt(c.annualFee)}/yr</span>
        </div>
      ))}
    </div>
  </div>
)}
```

### 4.2 CrashReplay.jsx — additions

Add inside the crash event card, below existing sector bars:

```jsx
// ── Add state for contagion toggle ──
const [withContagion, setWithContagion] = useState(false);

// ── After the big loss number ──
{/* Portfolio vs Nifty */}
{selected && (
  <div className={`text-sm text-center ${
    selected.portfolioLossPct > Math.abs(selected.event.niftyDrawdown) ? 'text-red-600' : 'text-green-600'
  }`}>
    Nifty fell {Math.abs(selected.event.niftyDrawdown)}%. Your portfolio fell {selected.portfolioLossPct}%.
    {selected.portfolioLossPct > Math.abs(selected.event.niftyDrawdown)
      ? ` You did ${(selected.portfolioLossPct - Math.abs(selected.event.niftyDrawdown)).toFixed(1)} points worse.`
      : ` You did ${(Math.abs(selected.event.niftyDrawdown) - selected.portfolioLossPct).toFixed(1)} points better.`
    }
  </div>
)}

{/* Recovery timeline */}
{recovery && (
  <div className="bg-gray-50 rounded-xl p-4 text-center">
    <span className="text-sm text-gray-500">Estimated recovery: </span>
    <span className="text-lg font-medium text-gray-900">{recovery.recoveryMonths} months</span>
    <span className="text-sm text-gray-500"> to return to pre-crash levels</span>
  </div>
)}

{/* Per-fund attribution */}
{fundLosses && (
  <div>
    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Which fund hurt you most?</h4>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {fundLosses.map(f => (
        <div key={f.fundName} className="bg-red-50 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">{f.shortName}</div>
          <div className="text-lg font-medium text-red-600">−{fmt(f.loss)}</div>
          <div className="text-xs text-red-400">{f.lossPct}% · worst: {f.worstSector} {f.worstSectorDrop}%</div>
        </div>
      ))}
    </div>
  </div>
)}
```

### 4.3 ContagionMap.jsx — additions

```jsx
// ── Add worst triggers computation in useMemo ──
const worstTriggers = useMemo(
  () => findWorstTriggers(totalInvested, sectorExposure, 30),
  [totalInvested, sectorExposure]
);

// ── Default triggerSector to the worst trigger ──
const [triggerSector, setTriggerSector] = useState('');
useEffect(() => {
  if (worstTriggers.length > 0) setTriggerSector(worstTriggers[0].sector);
}, [worstTriggers]);

// ── Add above the dropdown controls ──
{worstTriggers.length > 0 && (
  <div>
    <p className="text-sm text-gray-600 mb-2">
      Your most dangerous trigger is <span className="font-medium text-red-600">{worstTriggers[0].sector}</span> —
      a 30% crash cascades to {worstTriggers[0].cascadeCount} other sectors, costing{' '}
      <span className="font-medium text-red-600">{fmt(worstTriggers[0].totalLoss)}</span>.
    </p>
    <div className="flex flex-wrap gap-2 mb-4">
      {worstTriggers.slice(0, 3).map(t => (
        <button key={t.sector} onClick={() => setTriggerSector(t.sector)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            triggerSector === t.sector ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}>
          {t.sector}: {fmt(t.totalLoss)}
        </button>
      ))}
    </div>
  </div>
)}

// ── Add below the cascade bars ──
{safeHavenResult && safeHavenResult.safeHavens.length > 0 && (
  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
    <div className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Shock absorbers</div>
    <p className="text-sm text-green-800">
      {safeHavenResult.safeHavens.map(s => s.sector).join(', ')} ({fmt(safeHavenResult.totalProtected)})
      {safeHavenResult.safeHavens.length > 1 ? ' are' : ' is'} not correlated with {triggerSector}.
      {safeHavenResult.totalProtected > 0 ? ' This money acts as your portfolio\'s shock absorber.' : ''}
    </p>
  </div>
)}
{safeHavenResult && safeHavenResult.safeHavens.length === 0 && (
  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
    <div className="text-xs font-medium text-red-700 uppercase tracking-wide mb-1">No shock absorbers</div>
    <p className="text-sm text-red-800">
      Every sector in your portfolio is connected to {triggerSector}. You have no defensive exposure to cushion this crash.
    </p>
  </div>
)}
```

### 4.4 FundSwapLab.jsx — mode toggle and additions

```jsx
// ── Replace the existing single mode with a 3-mode toggle ──
const [mode, setMode] = useState('swap'); // 'swap' | 'rebalance' | 'fitment'
const [rebalanceAmounts, setRebalanceAmounts] = useState(portfolio.map(p => p.amount));
const [fitmentFund, setFitmentFund] = useState(null);
const [fitmentAmount, setFitmentAmount] = useState(100000);

// ── Add at top of the component's JSX ──
<div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
  {[
    { key: 'swap', label: 'Swap a fund' },
    { key: 'rebalance', label: 'Rebalance amounts' },
    { key: 'fitment', label: 'Test adding a fund' },
  ].map(m => (
    <button key={m.key} onClick={() => setMode(m.key)}
      className={`flex-1 text-sm py-1.5 px-3 rounded-md transition-colors ${
        mode === m.key ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'
      }`}>
      {m.label}
    </button>
  ))}
</div>

{/* ── Swap mode = existing code (unchanged) ── */}
{mode === 'swap' && ( /* ... existing swap UI ... */ )}

{/* ── Rebalance mode ── */}
{mode === 'rebalance' && (
  <div className="space-y-4">
    <p className="text-sm text-gray-500">Drag sliders to redistribute money across your existing funds. Total stays the same.</p>
    {portfolio.map((entry, i) => {
      const shortName = entry.fund.name.split(' - ')[0].split(' Fund')[0];
      return (
        <div key={entry.fund.schemeCode} className="flex items-center gap-3">
          <span className="w-36 text-sm text-gray-700 truncate">{shortName}</span>
          <input type="range" min={50000} max={entry.amount * 2}
            step={10000} value={rebalanceAmounts[i]}
            onChange={e => {
              const newAmts = [...rebalanceAmounts];
              const diff = +e.target.value - newAmts[i];
              newAmts[i] = +e.target.value;
              // Redistribute diff proportionally to other funds
              const otherTotal = newAmts.filter((_, j) => j !== i).reduce((s, a) => s + a, 0);
              for (let j = 0; j < newAmts.length; j++) {
                if (j !== i) newAmts[j] = Math.max(50000, newAmts[j] - Math.round(diff * newAmts[j] / otherTotal));
              }
              setRebalanceAmounts(newAmts);
            }}
            className="flex-1" />
          <span className="w-24 text-right text-sm font-medium">{fmt(rebalanceAmounts[i])}</span>
        </div>
      );
    })}
    {rebalanceResult && (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Current overlap</div>
          <div className="text-xl font-medium">{rebalanceResult.before.avgOverlap}%</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="text-xs text-green-600 mb-1">After rebalance</div>
          <div className="text-xl font-medium text-green-800">
            {rebalanceResult.after.avgOverlap}%
            <span className="text-sm ml-1">({rebalanceResult.delta.overlapChange > 0 ? '+' : ''}{rebalanceResult.delta.overlapChange})</span>
          </div>
        </div>
      </div>
    )}
    <button onClick={() => { /* run optimizeAmounts and update sliders */ }}
      className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
      Optimize for me
    </button>
  </div>
)}

{/* ── Fitment mode ── */}
{mode === 'fitment' && (
  <div className="space-y-4">
    <p className="text-sm text-gray-500">Thinking of adding a fund? Test how it would change your portfolio.</p>
    {/* Fund search dropdown — same as PortfolioInput */}
    <div className="flex gap-3">
      <select value={fitmentFund?.schemeCode ?? ''} onChange={e => {
        setFitmentFund(allFunds.find(f => f.schemeCode === e.target.value));
      }} className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2">
        <option value="">Select a fund to test...</option>
        {allFunds.filter(f => !portfolio.some(p => p.fund.schemeCode === f.schemeCode)).map(f => (
          <option key={f.schemeCode} value={f.schemeCode}>{f.name.split(' - ')[0]}</option>
        ))}
      </select>
      <input type="number" value={fitmentAmount} onChange={e => setFitmentAmount(+e.target.value)}
        min={10000} step={10000} placeholder="Amount ₹"
        className="w-32 text-sm border border-gray-200 rounded-lg px-3 py-2" />
    </div>
    {fitmentResult && (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">Current overlap</div>
            <div className="text-xl font-medium">{fitmentResult.before.avgOverlap}%</div>
          </div>
          <div className={`rounded-xl p-4 border ${
            fitmentResult.verdictColor === 'green' ? 'bg-green-50 border-green-200' :
            fitmentResult.verdictColor === 'amber' ? 'bg-amber-50 border-amber-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="text-xs text-gray-500 mb-1">After adding this fund</div>
            <div className="text-xl font-medium">{fitmentResult.after.avgOverlap}%
              <span className="text-sm ml-1">({fitmentResult.delta.overlapChange > 0 ? '+' : ''}{fitmentResult.delta.overlapChange})</span>
            </div>
          </div>
        </div>
        <div className={`rounded-xl p-4 border-l-4 ${
          fitmentResult.verdictColor === 'green' ? 'border-l-green-400 bg-green-50' :
          fitmentResult.verdictColor === 'amber' ? 'border-l-amber-400 bg-amber-50' :
          'border-l-red-400 bg-red-50'
        }`}>
          <p className="text-sm">{fitmentResult.verdict}</p>
        </div>
      </>
    )}
  </div>
)}
```

### 4.5 RupeeAtRisk.jsx — additions

```jsx
// ── Add state ──
const [niftyDrop, setNiftyDrop] = useState('');
const [monthlySIP, setMonthlySIP] = useState(Math.round(varResult.totalInvested / 36));

// ── Add above the existing big VaR number card ──
{/* Panic mode */}
<div className="space-y-3">
  <h3 className="text-sm font-medium text-gray-700">Market dropped today?</h3>
  <div className="flex items-center gap-3">
    <span className="text-sm text-gray-500">Nifty dropped</span>
    <input type="number" value={niftyDrop} onChange={e => setNiftyDrop(e.target.value)}
      placeholder="e.g. 3" step="0.1" min="0.1" max="20"
      className="w-24 text-sm border border-gray-200 rounded-lg px-3 py-2 text-center" />
    <span className="text-sm text-gray-500">% today</span>
  </div>
  {niftyDrop > 0 && panicResult && (
    <div className={`rounded-xl p-5 border ${
      panicResult.severityColor === 'green' ? 'border-green-200 bg-green-50' :
      panicResult.severityColor === 'amber' ? 'border-amber-200 bg-amber-50' :
      'border-red-200 bg-red-50'
    }`}>
      <div className="text-center mb-3">
        <div className="text-2xl font-medium text-gray-900">−{fmt(panicResult.totalLoss)}</div>
        <div className="text-sm text-gray-500 mt-1">
          Your estimated loss today · {panicResult.pctOfVar}% of your monthly VaR
        </div>
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        {panicResult.topSectorLosses.map(s => (
          <div key={s.sector} className="flex justify-between">
            <span>{s.sector} (β={s.beta.toFixed(1)}, fell {s.sectorDrop}%)</span>
            <span>−{fmt(s.loss)}</span>
          </div>
        ))}
      </div>
      <p className={`text-sm mt-3 font-medium ${
        panicResult.severityColor === 'green' ? 'text-green-700' :
        panicResult.severityColor === 'amber' ? 'text-amber-700' : 'text-red-700'
      }`}>{panicResult.severity}</p>
    </div>
  )}
</div>

{/* ── Add below the existing VaR95 big number card ── */}
{/* SIP months lost */}
<div className="flex items-center gap-3 text-sm">
  <span className="text-gray-500">Your monthly SIP:</span>
  <input type="number" value={monthlySIP} onChange={e => setMonthlySIP(+e.target.value)}
    min={1000} step={1000}
    className="w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-center" />
  {monthlySIP > 0 && (
    <span className="text-gray-700">
      → A bad month wipes out <span className="font-medium text-red-600">
        {(varResult.var95.rupees / monthlySIP).toFixed(1)} months
      </span> of SIP contributions
    </span>
  )}
</div>

{/* ── Add below the 3 VaR tier cards ── */}
{/* Risk budget per fund */}
{riskBudget && (
  <div>
    <h3 className="text-sm font-medium text-gray-700 mb-3">Risk budget — which fund adds the most risk?</h3>
    <div className="space-y-2">
      {riskBudget.map(b => (
        <div key={b.fundName} className="flex items-center text-sm">
          <span className="w-36 text-gray-700 truncate">{b.shortName}</span>
          <div className="flex-1 mx-3 h-3 bg-gray-100 rounded-full overflow-hidden relative">
            {/* Investment share (light) */}
            <div className="absolute h-full bg-blue-200 rounded-full" style={{width: `${b.investmentPct}%`}} />
            {/* Risk share (darker, overlaid) */}
            <div className={`absolute h-full rounded-full ${
              b.verdict === 'disproportionate' ? 'bg-red-400' :
              b.verdict === 'efficient' ? 'bg-green-400' : 'bg-amber-300'
            }`} style={{width: `${b.riskPct}%`}} />
          </div>
          <span className="w-20 text-right text-xs text-gray-500">{b.riskPct}% risk</span>
          <span className="w-20 text-right text-xs text-gray-400">{b.investmentPct}% money</span>
          <span className={`w-6 text-center ${
            b.verdict === 'disproportionate' ? 'text-red-500' :
            b.verdict === 'efficient' ? 'text-green-500' : 'text-amber-400'
          }`}>
            {b.verdict === 'disproportionate' ? '⚠' : b.verdict === 'efficient' ? '✓' : '·'}
          </span>
        </div>
      ))}
    </div>
    {riskBudget[0]?.verdict === 'disproportionate' && (
      <p className="text-xs text-gray-500 mt-2">
        {riskBudget[0].shortName} contributes {riskBudget[0].riskPct}% of your risk with only {riskBudget[0].investmentPct}% of your money.
        Consider reducing it in the Fund Swap Lab.
      </p>
    )}
  </div>
)}
```

---

## 5. App.jsx — Updated Computation

Add these computations inside `runAnalysis`, after the existing V2.1 computations:

```jsx
// ── V2.2: Deeper analysis (all client-side, instant) ─────────────────────
const niftyComparison = compareWithNifty(ghost);
const fundContributions = computeFundContributions(port, ghost);
const capBreakdown = computeCapBreakdown(port);
const worstTriggers = findWorstTriggers(totalInvested, sectorExposure, 30);

// Crash replay enrichments — compute for each replay
const enrichedReplays = crashReplays.map(replay => ({
  ...replay,
  recovery: computeRecoveryTimeline(sectorExposure, replay.event.id),
  fundLosses: computePerFundLoss(port, replay.event),
  vsNifty: portfolioVsNifty(replay.portfolioLossPct, replay.event.niftyDrawdown),
}));

// Risk budget
const riskBudget = computeRiskBudget(port, sectorExposure, rupeeAtRisk);
// ──────────────────────────────────────────────────────────────────────────

setResults({
  // ... existing V2.1 results ...
  // V2.2 additions
  niftyComparison,
  fundContributions,
  capBreakdown,
  worstTriggers,
  enrichedReplays, // replaces crashReplays
  riskBudget,
});
```

Pass the new data as props to existing components:

```jsx
<GhostPortfolio
  ghost={results.ghost}
  niftyComp={results.niftyComparison}
  fundContribs={results.fundContributions}
  capBreakdown={results.capBreakdown}
/>
<CrashReplay
  replays={results.enrichedReplays}
/>
<ContagionMap
  totalInvested={results.totalInvested}
  sectorExposure={results.sectorExposure}
  worstTriggers={results.worstTriggers}
/>
<FundSwapLab
  portfolio={portfolio}
  allFunds={allFunds}
/>
<RupeeAtRisk
  varResult={results.rupeeAtRisk}
  sectorExposure={results.sectorExposure}
  riskBudget={results.riskBudget}
  portfolio={portfolio}
/>
```

---

## 6. Build Order (6–8 hours)

| Hours | Task | Files |
|---|---|---|
| 0:00 – 0:30 | Create 3 new data files. Test imports | `niftyBenchmark.js`, `sectorBetas.js`, `crashRecovery.js` |
| 0:30 – 1:30 | Ghost Portfolio lib additions: `stockStressTest`, `compareWithNifty`, `computeFundContributions`, `computeCapBreakdown`. Console-test each against Demo 1 | `ghostPortfolio.js` |
| 1:30 – 2:15 | Crash Replay lib additions: `computeRecoveryTimeline`, `computePerFundLoss`, `portfolioVsNifty`. Test against COVID Demo 1 | `crashReplay.js` |
| 2:15 – 2:45 | Contagion lib additions: `findWorstTriggers`, `findSafeHavens`. Verify Banking is worst trigger for Demo 1 | `contagion.js` |
| 2:45 – 3:30 | Fund Swap lib additions: `simulateRebalance`, `checkFitment`, `optimizeAmounts`. Test rebalance with Demo 2 | `fundSwap.js` |
| 3:30 – 4:00 | Rupee-at-Risk lib additions: `panicModeCalc`, `sipMonthsLost`, `computeRiskBudget`. Test panic with Nifty −3% | `rupeeAtRisk.js` |
| 4:00 – 5:00 | GhostPortfolio.jsx: add stock stress test + cap breakdown + Nifty comparison + fund contribution | `GhostPortfolio.jsx` |
| 5:00 – 5:45 | CrashReplay.jsx: add recovery + per-fund loss + vs Nifty | `CrashReplay.jsx` |
| 5:45 – 6:15 | ContagionMap.jsx: add worst trigger pills + safe-haven card | `ContagionMap.jsx` |
| 6:15 – 7:15 | FundSwapLab.jsx: add 3-mode toggle + rebalance sliders + fitment check | `FundSwapLab.jsx` |
| 7:15 – 7:45 | RupeeAtRisk.jsx: add panic mode + SIP months + risk budget | `RupeeAtRisk.jsx` |
| 7:45 – 8:00 | Wire new props in App.jsx. Test all 3 demos end-to-end | `App.jsx` |

**Critical path:** All lib additions must be tested in console before touching any JSX. Data files → lib functions → components → wiring.

---

## 7. Testing Checklist

### Ghost Portfolio Additions
- [ ] Stock stress: HDFC Bank 20% drop shows ~₹9,400 for Demo 1
- [ ] Nifty comparison table: Demo 1 HHI > Nifty HHI, fee multiple > 5x
- [ ] Demo 3: HHI comparable to Nifty, fee multiple < 3x
- [ ] Fund contribution: Axis Bluechip < 15% contribution in Demo 1
- [ ] Cap breakdown: Demo 1 shows ~92% large cap
- [ ] Cap breakdown: Demo 3 shows significant small-cap allocation

### Crash Replay Additions
- [ ] Recovery: COVID Demo 1 shows 12–15 months
- [ ] Recovery: COVID Demo 3 shows 8–11 months (shorter)
- [ ] Per-fund loss: Axis Bluechip shows highest loss % in Demo 1 COVID
- [ ] vs Nifty: Demo 1 shows "worse than market" (red). Demo 3 shows "better" (green)

### Contagion Additions
- [ ] Worst trigger auto-selects Banking for Demo 1
- [ ] Top 3 trigger pills are clickable and update the cascade
- [ ] Safe-haven card appears green for sectors not in cascade
- [ ] Demo 1 Banking crash shows Pharma/FMCG as safe havens

### Fund Swap Lab Additions
- [ ] 3-mode toggle renders. All 3 modes work independently
- [ ] Rebalance sliders maintain total investment constant
- [ ] Rebalance shows live overlap/sector delta
- [ ] Fitment check: adding Quant Small Cap to Demo 3 shows green verdict
- [ ] Fitment check: adding SBI Bluechip to Demo 1 shows red verdict (duplicates)
- [ ] "Optimize for me" button finds a better split than current

### Rupee-at-Risk Additions
- [ ] Panic mode: entering 3 shows ~₹14,000 for Demo 1
- [ ] Panic mode: context shows "31% of VaR — normal" in green
- [ ] SIP months: ₹10,000 SIP shows ~4.7 months for Demo 1
- [ ] Risk budget: Axis Bluechip shows disproportionate risk in Demo 1
- [ ] Risk budget: bars render correctly, warning emoji on highest risk fund
