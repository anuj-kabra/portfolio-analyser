# Technical Requirements Document — V2 Features
## MF Portfolio Analyzer — Ghost Portfolio, Crash Replay, Contagion Map, Fund Swap Lab, Rupee-at-Risk

**Version:** 2.1  
**Date:** March 18, 2026  
**Builds on:** TRD v2.0 (all existing features working)  
**Estimated additional build time:** 6–8 hours  

---

## 1. New File Structure

```
frontend/src/
├── data/
│   ├── demoPortfolios.js          # existing
│   ├── historicalCrashes.js       # NEW — 5 real Indian market events
│   ├── sectorCorrelations.js      # NEW — cross-sector correlation matrix
│   └── sectorVolatility.js        # NEW — monthly vol data per sector
├── lib/
│   ├── overlap.js                 # existing
│   ├── sectorRisk.js              # existing
│   ├── eli5.js                    # existing
│   ├── ghostPortfolio.js          # NEW — merge holdings, HHI, TER
│   ├── crashReplay.js             # NEW — historical event replay engine
│   ├── contagion.js               # NEW — cascade simulator
│   ├── fundSwap.js                # NEW — swap simulation logic
│   └── rupeeAtRisk.js             # NEW — VaR computation
├── components/
│   ├── DemoButtons.jsx            # existing
│   ├── PortfolioInput.jsx         # existing
│   ├── OverlapMatrix.jsx          # existing
│   ├── SectorChart.jsx            # existing
│   ├── CrashSimulator.jsx         # existing
│   ├── ELI5Section.jsx            # existing
│   ├── AIInsights.jsx             # existing
│   ├── GhostPortfolio.jsx         # NEW
│   ├── CrashReplay.jsx            # NEW
│   ├── ContagionMap.jsx           # NEW
│   ├── FundSwapLab.jsx            # NEW
│   └── RupeeAtRisk.jsx            # NEW
└── App.jsx                        # MODIFIED — wire new components
```

---

## 2. Data Files

### 2.1 historicalCrashes.js

Real Indian market events with actual sector-level drawdowns (sourced from NSE sector index data).

```javascript
// src/data/historicalCrashes.js

export const HISTORICAL_CRASHES = [
  {
    id: 'covid-2020',
    name: 'COVID-19 Crash',
    date: 'March 2020',
    duration: '23 trading days',
    headline: 'Nifty fell 38% in 23 days. Worst crash since 2008.',
    description: 'Global pandemic triggered the fastest bear market in Indian history. Banking and real estate were hit hardest as lockdowns froze economic activity.',
    sectorDrawdowns: {
      'Banking': -43.2,
      'IT': -28.5,
      'Pharma': -18.3,
      'Auto': -41.7,
      'FMCG': -22.1,
      'Metals': -38.9,
      'Realty': -46.5,
      'Energy': -36.2,
      'Infrastructure': -39.8,
      'Telecom': -25.4,
      'Media': -35.6,
      'Financial Services': -42.1,
      'Consumer Durables': -33.2,
      'Chemicals': -30.8,
      'Healthcare': -19.5,
      'Textiles': -37.4,
      'Capital Goods': -36.1,
      'Insurance': -38.7,
      'NBFC': -44.8,
    },
    niftyDrawdown: -38.0,
  },
  {
    id: 'ilfs-2018',
    name: 'IL&FS / NBFC Crisis',
    date: 'Sep–Oct 2018',
    duration: '6 weeks',
    headline: 'IL&FS defaulted. NBFC and housing finance stocks collapsed 25–50%.',
    description: 'IL&FS default triggered a liquidity crisis across NBFCs and housing finance companies. Contagion spread to banking as credit markets froze.',
    sectorDrawdowns: {
      'Banking': -18.3,
      'IT': -5.2,
      'Pharma': -8.1,
      'Auto': -22.4,
      'FMCG': -6.8,
      'Metals': -14.6,
      'Realty': -28.3,
      'Energy': -12.1,
      'Infrastructure': -19.7,
      'Telecom': -9.4,
      'Media': -21.3,
      'Financial Services': -25.6,
      'Consumer Durables': -15.2,
      'Chemicals': -11.9,
      'Healthcare': -7.8,
      'Textiles': -16.5,
      'Capital Goods': -17.8,
      'Insurance': -22.1,
      'NBFC': -41.5,
    },
    niftyDrawdown: -15.8,
  },
  {
    id: 'demonetization-2016',
    name: 'Demonetization Shock',
    date: 'Nov–Dec 2016',
    duration: '8 weeks',
    headline: '86% of currency invalidated overnight. Cash-dependent sectors crashed.',
    description: 'PM Modi announced demonetization of ₹500 and ₹1000 notes. Real estate, consumer discretionary, and small businesses were devastated. IT and pharma (export-driven) were relatively insulated.',
    sectorDrawdowns: {
      'Banking': -12.4,
      'IT': -4.8,
      'Pharma': -6.2,
      'Auto': -15.3,
      'FMCG': -8.9,
      'Metals': -7.5,
      'Realty': -25.1,
      'Energy': -9.3,
      'Infrastructure': -11.2,
      'Telecom': -6.7,
      'Media': -13.8,
      'Financial Services': -14.6,
      'Consumer Durables': -18.4,
      'Chemicals': -8.1,
      'Healthcare': -5.9,
      'Textiles': -16.2,
      'Capital Goods': -12.7,
      'Insurance': -10.3,
      'NBFC': -19.8,
    },
    niftyDrawdown: -8.5,
  },
  {
    id: 'china-2015',
    name: 'China-led Global Selloff',
    date: 'Aug–Sep 2015',
    duration: '5 weeks',
    headline: 'China devalued yuan. Global emerging markets sold off. Nifty fell 12%.',
    description: 'China\'s surprise yuan devaluation and economic slowdown fears triggered capital flight from all emerging markets including India. Metals and commodities were hit hardest.',
    sectorDrawdowns: {
      'Banking': -14.8,
      'IT': -8.3,
      'Pharma': -6.5,
      'Auto': -13.9,
      'FMCG': -7.2,
      'Metals': -22.8,
      'Realty': -16.4,
      'Energy': -18.6,
      'Infrastructure': -15.2,
      'Telecom': -9.1,
      'Media': -14.7,
      'Financial Services': -15.3,
      'Consumer Durables': -11.6,
      'Chemicals': -13.2,
      'Healthcare': -7.1,
      'Textiles': -12.8,
      'Capital Goods': -16.9,
      'Insurance': -12.5,
      'NBFC': -17.3,
    },
    niftyDrawdown: -12.2,
  },
  {
    id: 'global-2008',
    name: '2008 Global Financial Crisis',
    date: 'Jan–Oct 2008',
    duration: '10 months',
    headline: 'Lehman collapsed. Nifty fell 60% from peak. The worst crash in Indian market history.',
    description: 'Global credit crisis wiped out trillions. FIIs pulled $13 billion from India. Every sector was hit — realty and metals lost 70%+. Recovery took over a year.',
    sectorDrawdowns: {
      'Banking': -62.5,
      'IT': -55.3,
      'Pharma': -38.2,
      'Auto': -58.7,
      'FMCG': -30.4,
      'Metals': -72.1,
      'Realty': -78.3,
      'Energy': -60.8,
      'Infrastructure': -68.4,
      'Telecom': -52.6,
      'Media': -61.2,
      'Financial Services': -64.5,
      'Consumer Durables': -55.8,
      'Chemicals': -48.9,
      'Healthcare': -36.7,
      'Textiles': -57.3,
      'Capital Goods': -65.2,
      'Insurance': -58.1,
      'NBFC': -70.4,
    },
    niftyDrawdown: -60.0,
  },
];
```

### 2.2 sectorCorrelations.js

Cross-sector drawdown correlations based on historical co-movement during stress events.

```javascript
// src/data/sectorCorrelations.js
// Each entry: [sectorA, sectorB, correlationCoefficient]
// Correlation = how much sectorB drops when sectorA drops
// Only includes pairs with correlation > 0.5 (significant co-movement)

export const SECTOR_CORRELATIONS = [
  // Banking cascade — the big one
  ['Banking', 'NBFC', 0.88],
  ['Banking', 'Financial Services', 0.92],
  ['Banking', 'Insurance', 0.74],
  ['Banking', 'Realty', 0.68],
  ['Banking', 'Infrastructure', 0.62],

  // NBFC cascade
  ['NBFC', 'Realty', 0.78],
  ['NBFC', 'Financial Services', 0.85],
  ['NBFC', 'Insurance', 0.71],

  // IT cascade
  ['IT', 'Telecom', 0.58],

  // Auto cascade
  ['Auto', 'Capital Goods', 0.65],
  ['Auto', 'Metals', 0.55],

  // Metals/Energy
  ['Metals', 'Energy', 0.62],
  ['Metals', 'Infrastructure', 0.58],
  ['Metals', 'Capital Goods', 0.52],

  // Energy
  ['Energy', 'Chemicals', 0.56],
  ['Energy', 'Infrastructure', 0.54],

  // Infrastructure
  ['Infrastructure', 'Capital Goods', 0.72],
  ['Infrastructure', 'Realty', 0.64],

  // Realty
  ['Realty', 'Capital Goods', 0.55],

  // Defensive (low correlation with cyclicals — included for completeness)
  ['Pharma', 'Healthcare', 0.82],
  ['FMCG', 'Consumer Durables', 0.51],
];

// Helper: build a lookup map for quick access
export function getCorrelationMap() {
  const map = new Map();
  for (const [a, b, corr] of SECTOR_CORRELATIONS) {
    const keyAB = `${a}|${b}`;
    const keyBA = `${b}|${a}`;
    map.set(keyAB, corr);
    map.set(keyBA, corr);
  }
  return map;
}
```

### 2.3 sectorVolatility.js

Monthly standard deviation of returns per sector (annualised, from 5 years of NSE sector index data).

```javascript
// src/data/sectorVolatility.js
// Annualized monthly return standard deviation (%)
// Used for Rupee-at-Risk VaR computation

export const SECTOR_VOLATILITY = {
  'Banking': 28.4,
  'IT': 24.6,
  'Pharma': 22.1,
  'Auto': 26.8,
  'FMCG': 16.3,
  'Metals': 34.2,
  'Realty': 38.5,
  'Energy': 29.7,
  'Infrastructure': 30.1,
  'Telecom': 25.3,
  'Media': 31.8,
  'Financial Services': 27.9,
  'Consumer Durables': 25.7,
  'Chemicals': 27.3,
  'Healthcare': 21.8,
  'Textiles': 29.5,
  'Capital Goods': 28.9,
  'Insurance': 26.4,
  'NBFC': 32.6,
};

// Default volatility for sectors not in the map
export const DEFAULT_VOLATILITY = 26.0;
```

---

## 3. Core Logic — New Library Files

### 3.1 ghostPortfolio.js

Merges all fund holdings into one consolidated view. Computes effective HHI, TER, and benchmark comparison.

```javascript
// src/lib/ghostPortfolio.js

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

/**
 * Merge all fund holdings into a single "ghost" portfolio.
 * Each holding's effective weight = (fundWeight in portfolio) × (stock weight in fund)
 */
export function buildGhostPortfolio(portfolio) {
  const totalInvested = portfolio.reduce((s, p) => s + p.amount, 0);
  const stockMap = new Map(); // isin → { name, sector, effectiveWeight, heldBy: [fundNames] }

  for (const { fund, amount } of portfolio) {
    const fundWeight = amount / totalInvested;

    for (const h of fund.holdings) {
      const effectiveWeight = h.weight * fundWeight;

      if (stockMap.has(h.isin)) {
        const existing = stockMap.get(h.isin);
        existing.effectiveWeight += effectiveWeight;
        if (!existing.heldBy.includes(fund.name)) {
          existing.heldBy.push(fund.name);
        }
      } else {
        stockMap.set(h.isin, {
          isin: h.isin,
          name: h.name,
          sector: h.sector,
          effectiveWeight,
          heldBy: [fund.name],
        });
      }
    }
  }

  // Sort by effective weight descending
  const mergedHoldings = [...stockMap.values()]
    .sort((a, b) => b.effectiveWeight - a.effectiveWeight);

  // Top 20 holdings
  const top20 = mergedHoldings.slice(0, 20);

  // HHI (Herfindahl-Hirschman Index) — sum of squared weights
  // HHI < 1000 = diversified, 1000-2500 = moderate, > 2500 = concentrated
  const hhi = Math.round(
    mergedHoldings.reduce((sum, h) => sum + Math.pow(h.effectiveWeight, 2), 0) * 100
  );

  // Count unique stocks vs redundant stocks
  const totalStocks = mergedHoldings.length;
  const uniqueStocks = mergedHoldings.filter(h => h.heldBy.length === 1).length;
  const redundantStocks = mergedHoldings.filter(h => h.heldBy.length >= 2).length;
  const tripleHeld = mergedHoldings.filter(h => h.heldBy.length >= 3).length;

  // Effective TER (weighted average of fund TERs)
  // Note: requires fund.ter field in funds.json — see section 7 below
  const effectiveTER = portfolio.reduce((sum, { fund, amount }) => {
    return sum + (fund.ter ?? 0.5) * (amount / totalInvested);
  }, 0);

  // Annual fee in rupees
  const annualFeeRupees = Math.round(totalInvested * effectiveTER / 100);

  // Nifty 50 index fund comparison TER (typical: 0.10%)
  const indexFundTER = 0.10;
  const indexFundFee = Math.round(totalInvested * indexFundTER / 100);
  const excessFee = annualFeeRupees - indexFundFee;

  // Top 10 weight concentration
  const top10Weight = top20.slice(0, 10)
    .reduce((s, h) => s + h.effectiveWeight, 0);

  return {
    mergedHoldings,
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
    top10Weight: +top10Weight.toFixed(1),
    totalInvested,
  };
}

/**
 * Generate plain-English ghost portfolio summary
 */
export function ghostSummaryText(ghost) {
  const { totalStocks, redundantStocks, tripleHeld, hhi, excessFee, top10Weight } = ghost;

  let concentration;
  if (hhi > 2500) {
    concentration = 'highly concentrated — comparable to holding just 4–5 individual stocks';
  } else if (hhi > 1000) {
    concentration = 'moderately concentrated — you have some diversification but key stocks dominate';
  } else {
    concentration = 'well-diversified — no single stock dominates your portfolio';
  }

  return {
    line1: `Across all your funds, you actually own ${totalStocks} unique stocks. But ${redundantStocks} of them appear in 2+ funds${tripleHeld > 0 ? ` and ${tripleHeld} appear in all your funds` : ''}.`,
    line2: `Your top 10 stocks make up ${top10Weight}% of your entire portfolio. Your concentration is ${concentration}.`,
    line3: excessFee > 0
      ? `You are paying ${fmt(ghost.annualFeeRupees)}/year in fund fees. A single Nifty 50 index fund would cost ${fmt(ghost.indexFundFee)}/year — saving you ${fmt(excessFee)} every year for a very similar portfolio.`
      : `Your fee structure is efficient at ${fmt(ghost.annualFeeRupees)}/year.`,
  };
}
```

### 3.2 crashReplay.js

Replays historical Indian market crashes against the user's specific portfolio.

```javascript
// src/lib/crashReplay.js
import { HISTORICAL_CRASHES } from '../data/historicalCrashes';

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

/**
 * Replay a single historical crash against the user's portfolio.
 * Returns sector-level breakdown and total loss.
 */
export function replayCrash(totalInvested, sectorExposure, crashEvent) {
  const sectorLosses = [];
  let totalLoss = 0;

  for (const [sector, data] of Object.entries(sectorExposure)) {
    const drawdown = crashEvent.sectorDrawdowns[sector];
    if (!drawdown) continue; // sector not in crash data — assume 0

    const sectorRupees = data.rupeeAmount;
    const loss = Math.round(sectorRupees * Math.abs(drawdown) / 100);
    totalLoss += loss;

    sectorLosses.push({
      sector,
      exposureRupees: sectorRupees,
      exposurePct: data.weightPct,
      drawdownPct: drawdown,
      lossRupees: loss,
    });
  }

  // Sort by loss descending
  sectorLosses.sort((a, b) => b.lossRupees - a.lossRupees);

  const portfolioLossPct = +((totalLoss / totalInvested) * 100).toFixed(1);

  return {
    event: crashEvent,
    totalLoss,
    portfolioLossPct,
    sectorLosses,
    totalInvested,
    // How much of the portfolio survives
    surviving: totalInvested - totalLoss,
  };
}

/**
 * Replay ALL historical crashes. Returns sorted worst-to-best.
 */
export function replayAllCrashes(totalInvested, sectorExposure) {
  return HISTORICAL_CRASHES
    .map(event => replayCrash(totalInvested, sectorExposure, event))
    .sort((a, b) => b.totalLoss - a.totalLoss);
}

/**
 * Generate comparison text for two portfolios under the same crash.
 * Useful for Fund Swap Lab before/after comparison.
 */
export function compareCrashImpact(totalA, sectorA, totalB, sectorB, crashEvent) {
  const resultA = replayCrash(totalA, sectorA, crashEvent);
  const resultB = replayCrash(totalB, sectorA, crashEvent);
  const saved = resultA.totalLoss - resultB.totalLoss;
  return { before: resultA, after: resultB, savedRupees: saved };
}
```

### 3.3 contagion.js

Simulates how a crash in one sector cascades to correlated sectors.

```javascript
// src/lib/contagion.js
import { getCorrelationMap } from '../data/sectorCorrelations';

const fmt = n => `₹${n.toLocaleString('en-IN')}`;
const corrMap = getCorrelationMap();

/**
 * Simulate a sector crash WITH contagion effects.
 *
 * @param {number} totalInvested
 * @param {Object} sectorExposure — from computeSectorExposure()
 * @param {string} triggerSector — the sector that crashes
 * @param {number} triggerCrashPct — crash severity (e.g. 30 for 30%)
 * @returns {{ directLoss, contagionLoss, totalLoss, cascade, simpleModelLoss }}
 */
export function simulateContagion(totalInvested, sectorExposure, triggerSector, triggerCrashPct) {
  const cascade = [];
  let directLoss = 0;
  let contagionLoss = 0;

  // Direct loss from trigger sector
  const triggerData = sectorExposure[triggerSector];
  if (triggerData) {
    directLoss = Math.round(triggerData.rupeeAmount * triggerCrashPct / 100);
    cascade.push({
      sector: triggerSector,
      type: 'direct',
      crashPct: triggerCrashPct,
      exposureRupees: triggerData.rupeeAmount,
      exposurePct: triggerData.weightPct,
      lossRupees: directLoss,
      correlation: 1.0,
    });
  }

  // Contagion to correlated sectors
  for (const [sector, data] of Object.entries(sectorExposure)) {
    if (sector === triggerSector) continue;

    const key = `${triggerSector}|${sector}`;
    const corr = corrMap.get(key);
    if (!corr || corr < 0.5) continue; // only significant correlations

    // Correlated sector drops by: triggerCrash × correlation coefficient
    const cascadeCrashPct = +(triggerCrashPct * corr).toFixed(1);
    const loss = Math.round(data.rupeeAmount * cascadeCrashPct / 100);
    contagionLoss += loss;

    cascade.push({
      sector,
      type: 'contagion',
      crashPct: cascadeCrashPct,
      exposureRupees: data.rupeeAmount,
      exposurePct: data.weightPct,
      lossRupees: loss,
      correlation: corr,
    });
  }

  // Sort cascade by loss descending
  cascade.sort((a, b) => b.lossRupees - a.lossRupees);

  const totalLoss = directLoss + contagionLoss;
  const simpleModelLoss = directLoss; // what the basic simulator shows

  return {
    triggerSector,
    triggerCrashPct,
    directLoss,
    contagionLoss,
    totalLoss,
    simpleModelLoss,
    underestimation: totalLoss - simpleModelLoss,
    underestimationPct: simpleModelLoss > 0
      ? +((contagionLoss / simpleModelLoss) * 100).toFixed(0)
      : 0,
    portfolioPctLoss: +((totalLoss / totalInvested) * 100).toFixed(1),
    cascade,
    totalInvested,
  };
}
```

### 3.4 fundSwap.js

Simulates replacing one fund with another and shows the impact on overlap, sector exposure, and risk.

```javascript
// src/lib/fundSwap.js
import { analyseOverlap } from './overlap';
import { computeSectorExposure, simulateCrash } from './sectorRisk';

/**
 * Simulate swapping one fund for another in the portfolio.
 *
 * @param {Array} currentPortfolio — [{ fund, amount }]
 * @param {number} removeIndex — index of fund to remove
 * @param {Object} replacementFund — the new fund object (from allFunds)
 * @param {Array} allFunds — full fund list (for ranking replacements)
 * @returns {{ before, after, delta }}
 */
export function simulateSwap(currentPortfolio, removeIndex, replacementFund) {
  const removedEntry = currentPortfolio[removeIndex];

  // Build new portfolio with the swap
  const newPortfolio = currentPortfolio.map((entry, i) => {
    if (i === removeIndex) {
      return { fund: replacementFund, amount: entry.amount };
    }
    return entry;
  });

  // Compute before/after metrics
  const beforeOverlap = analyseOverlap(currentPortfolio);
  const afterOverlap = analyseOverlap(newPortfolio);

  const beforeSector = computeSectorExposure(currentPortfolio);
  const afterSector = computeSectorExposure(newPortfolio);

  const totalInvested = currentPortfolio.reduce((s, p) => s + p.amount, 0);

  // Find top sector for crash comparison
  const topSectorBefore = Object.entries(beforeSector)[0];
  const topSectorAfter = Object.entries(afterSector)[0];

  const beforeCrash = simulateCrash(totalInvested, beforeSector, topSectorBefore[0], 30);
  const afterCrash = simulateCrash(totalInvested, afterSector, topSectorAfter[0], 30);

  return {
    removedFund: removedEntry.fund.name,
    replacementFund: replacementFund.name,
    amount: removedEntry.amount,
    before: {
      overlap: beforeOverlap,
      sectorExposure: beforeSector,
      avgOverlap: beforeOverlap.averageOverlapPct,
      topSector: topSectorBefore[0],
      topSectorPct: topSectorBefore[1].weightPct,
      worstCrashLoss: beforeCrash.rupeeLoss,
    },
    after: {
      overlap: afterOverlap,
      sectorExposure: afterSector,
      avgOverlap: afterOverlap.averageOverlapPct,
      topSector: topSectorAfter[0],
      topSectorPct: topSectorAfter[1].weightPct,
      worstCrashLoss: afterCrash.rupeeLoss,
    },
    delta: {
      overlapChange: +(afterOverlap.averageOverlapPct - beforeOverlap.averageOverlapPct).toFixed(1),
      topSectorChange: +(topSectorAfter[1].weightPct - topSectorBefore[1].weightPct).toFixed(1),
      crashLossSaved: beforeCrash.rupeeLoss - afterCrash.rupeeLoss,
    },
    newPortfolio,
  };
}

/**
 * Rank all possible replacements for a given fund position.
 * Returns top 5 candidates sorted by overlap reduction.
 */
export function rankReplacements(currentPortfolio, removeIndex, allFunds) {
  const removedFund = currentPortfolio[removeIndex].fund;
  const portfolioCodes = new Set(currentPortfolio.map(p => p.fund.schemeCode));

  // Candidates: same category, not already in portfolio
  const candidates = allFunds.filter(f =>
    !portfolioCodes.has(f.schemeCode) &&
    f.category === removedFund.category
  );

  // Score each candidate
  const scored = candidates.map(candidate => {
    const result = simulateSwap(currentPortfolio, removeIndex, candidate);
    return {
      fund: candidate,
      ...result,
      // Score = overlap reduction (lower is better) + crash loss reduction
      score: -result.delta.overlapChange + (result.delta.crashLossSaved / 1000),
    };
  });

  // Sort by best improvement
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 5);
}
```

### 3.5 rupeeAtRisk.js

Computes portfolio VaR (Value at Risk) using sector volatilities and portfolio exposure.

```javascript
// src/lib/rupeeAtRisk.js
import { SECTOR_VOLATILITY, DEFAULT_VOLATILITY } from '../data/sectorVolatility';
import { getCorrelationMap } from '../data/sectorCorrelations';

const fmt = n => `₹${n.toLocaleString('en-IN')}`;
const corrMap = getCorrelationMap();

/**
 * Compute portfolio volatility using sector volatilities and correlations.
 * Uses parametric VaR approach:
 *   Portfolio Variance = Σ(wi * wj * σi * σj * ρij) for all sector pairs
 *   Monthly VaR (95%) = portfolio_σ_monthly × 1.645
 *   Monthly VaR (99%) = portfolio_σ_monthly × 2.326
 */
export function computeRupeeAtRisk(totalInvested, sectorExposure) {
  const sectors = Object.entries(sectorExposure);

  // Portfolio variance computation
  let portfolioVariance = 0;

  for (let i = 0; i < sectors.length; i++) {
    const [sectorI, dataI] = sectors[i];
    const wi = dataI.weightPct / 100;
    const sigmaI = (SECTOR_VOLATILITY[sectorI] ?? DEFAULT_VOLATILITY) / 100;

    for (let j = 0; j < sectors.length; j++) {
      const [sectorJ, dataJ] = sectors[j];
      const wj = dataJ.weightPct / 100;
      const sigmaJ = (SECTOR_VOLATILITY[sectorJ] ?? DEFAULT_VOLATILITY) / 100;

      // Correlation: 1.0 if same sector, lookup from map, default 0.3
      let rho;
      if (i === j) {
        rho = 1.0;
      } else {
        const key = `${sectorI}|${sectorJ}`;
        rho = corrMap.get(key) ?? 0.3;
      }

      portfolioVariance += wi * wj * sigmaI * sigmaJ * rho;
    }
  }

  // Annualized portfolio volatility
  const annualVol = Math.sqrt(portfolioVariance);
  // Monthly volatility (approximate: annual / sqrt(12))
  const monthlyVol = annualVol / Math.sqrt(12);

  // VaR at different confidence levels (parametric, normal distribution)
  const var95Monthly = monthlyVol * 1.645;   // "bad month — once every ~2 years"
  const var99Monthly = monthlyVol * 2.326;   // "really bad month — once per decade"
  const var999Monthly = monthlyVol * 3.09;   // "black swan — once per 30 years"

  const var95Rupees = Math.round(totalInvested * var95Monthly);
  const var99Rupees = Math.round(totalInvested * var99Monthly);
  const var999Rupees = Math.round(totalInvested * var999Monthly);

  // Monthly expected loss (average of worst 5% months)
  // Expected Shortfall ≈ VaR × (φ(z) / (1-α)) where φ is normal pdf
  // At 95%: ES ≈ VaR_95 × 1.28
  const expectedShortfall = Math.round(var95Rupees * 1.28);

  return {
    totalInvested,
    annualVolPct: +(annualVol * 100).toFixed(1),
    monthlyVolPct: +(monthlyVol * 100).toFixed(1),
    var95: {
      pct: +(var95Monthly * 100).toFixed(1),
      rupees: var95Rupees,
      label: 'Bad month (once every ~2 years)',
    },
    var99: {
      pct: +(var99Monthly * 100).toFixed(1),
      rupees: var99Rupees,
      label: 'Really bad month (once per decade)',
    },
    var999: {
      pct: +(var999Monthly * 100).toFixed(1),
      rupees: var999Rupees,
      label: 'Black swan (once per 30 years)',
    },
    expectedShortfall: {
      rupees: expectedShortfall,
      label: 'Average loss in the worst 5% of months',
    },
  };
}

/**
 * Generate plain-English VaR summary.
 */
export function varSummaryText(var_result) {
  const { var95, var99, totalInvested } = var_result;
  return {
    headline: `In a bad month, you could lose up to ${fmt(var95.rupees)}`,
    detail: `That is ${var95.pct}% of your ${fmt(totalInvested)} portfolio. This kind of drop happens roughly once every 2 years based on how volatile your sectors are.`,
    worstCase: `In a once-per-decade bad month, the loss could reach ${fmt(var99.rupees)}. This is not a prediction — it is a measure of how much risk you are carrying right now.`,
  };
}
```

---

## 4. React Components

### 4.1 GhostPortfolio.jsx

```jsx
// src/components/GhostPortfolio.jsx
import { ghostSummaryText } from '../lib/ghostPortfolio';

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

const HHI_BANDS = [
  { max: 1000, label: 'Diversified', color: 'bg-green-50 text-green-700 border-green-200' },
  { max: 2500, label: 'Moderate', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { max: Infinity, label: 'Concentrated', color: 'bg-red-50 text-red-700 border-red-200' },
];

function getHHIBand(hhi) {
  return HHI_BANDS.find(b => hhi < b.max);
}

export default function GhostPortfolio({ ghost }) {
  if (!ghost) return null;

  const band = getHHIBand(ghost.hhi);
  const summary = ghostSummaryText(ghost);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-1">Your Ghost Portfolio</h2>
        <p className="text-sm text-gray-500">
          What you actually own when all your funds are merged into one.
        </p>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Unique stocks</div>
          <div className="text-xl font-medium text-gray-900">{ghost.totalStocks}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">In 2+ funds</div>
          <div className="text-xl font-medium text-amber-600">{ghost.redundantStocks}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">In all funds</div>
          <div className="text-xl font-medium text-red-600">{ghost.tripleHeld}</div>
        </div>
        <div className={`rounded-xl p-4 border ${band.color}`}>
          <div className="text-xs opacity-70 mb-1">Concentration (HHI)</div>
          <div className="text-xl font-medium">{ghost.hhi}</div>
          <div className="text-xs mt-0.5">{band.label}</div>
        </div>
      </div>

      {/* Top 20 holdings table */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Your true top 20 holdings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">#</th>
                <th className="text-left py-2 text-gray-500 font-medium">Stock</th>
                <th className="text-left py-2 text-gray-500 font-medium">Sector</th>
                <th className="text-right py-2 text-gray-500 font-medium">Weight</th>
                <th className="text-right py-2 text-gray-500 font-medium">Rupees</th>
                <th className="text-center py-2 text-gray-500 font-medium">Funds</th>
              </tr>
            </thead>
            <tbody>
              {ghost.top20.map((stock, i) => (
                <tr key={stock.isin} className="border-b border-gray-50">
                  <td className="py-2 text-gray-400">{i + 1}</td>
                  <td className="py-2 text-gray-900">{stock.name}</td>
                  <td className="py-2 text-gray-500">{stock.sector}</td>
                  <td className="py-2 text-right text-gray-900">{stock.effectiveWeight.toFixed(1)}%</td>
                  <td className="py-2 text-right text-gray-700">
                    {fmt(Math.round(ghost.totalInvested * stock.effectiveWeight / 100))}
                  </td>
                  <td className="py-2 text-center">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                      stock.heldBy.length >= 3
                        ? 'bg-red-50 text-red-700'
                        : stock.heldBy.length === 2
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-50 text-gray-500'
                    }`}>
                      {stock.heldBy.length}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee comparison */}
      {ghost.excessFee > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-2">
            Hidden fee cost
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">
            You are paying <span className="font-medium">{fmt(ghost.annualFeeRupees)}/year</span> in combined
            fund fees (effective TER: {ghost.effectiveTER}%). A single Nifty 50 index fund would cost just{' '}
            <span className="font-medium">{fmt(ghost.indexFundFee)}/year</span> — saving you{' '}
            <span className="font-medium">{fmt(ghost.excessFee)} every year</span> for
            a very similar stock portfolio.
          </p>
        </div>
      )}

      {/* ELI5 summary */}
      <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
        <p>{summary.line1}</p>
        <p>{summary.line2}</p>
        <p>{summary.line3}</p>
      </div>
    </div>
  );
}
```

### 4.2 CrashReplay.jsx

```jsx
// src/components/CrashReplay.jsx
import { useState } from 'react';
import { HISTORICAL_CRASHES } from '../data/historicalCrashes';

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

export default function CrashReplay({ replays }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  if (!replays || replays.length === 0) return null;

  const selected = replays[selectedIdx];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-1">Historical Crash Replay</h2>
        <p className="text-sm text-gray-500">
          What would have happened to your exact portfolio in real Indian market crashes.
        </p>
      </div>

      {/* Event selector — horizontal pills */}
      <div className="flex flex-wrap gap-2">
        {replays.map((replay, i) => (
          <button
            key={replay.event.id}
            onClick={() => setSelectedIdx(i)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              i === selectedIdx
                ? 'bg-red-50 border-red-300 text-red-700 font-medium'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {replay.event.name} ({replay.event.date})
          </button>
        ))}
      </div>

      {/* Selected event detail */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-5">
        {/* Event header */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-base font-medium text-gray-900">{selected.event.name}</h3>
            <span className="text-xs text-gray-400">{selected.event.date} · {selected.event.duration}</span>
          </div>
          <p className="text-sm text-gray-600">{selected.event.headline}</p>
        </div>

        {/* Big loss number */}
        <div className="text-center py-4">
          <div className="text-3xl font-medium text-red-600">−{fmt(selected.totalLoss)}</div>
          <div className="text-sm text-gray-500 mt-1">
            Your portfolio would have lost {selected.portfolioLossPct}%
            — dropping from {fmt(selected.totalInvested)} to {fmt(selected.surviving)}
          </div>
        </div>

        {/* Sector-by-sector breakdown */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Sector-by-sector damage
          </h4>
          <div className="space-y-2">
            {selected.sectorLosses.slice(0, 8).map(s => (
              <div key={s.sector} className="flex items-center text-sm">
                <span className="w-36 text-gray-700 truncate">{s.sector}</span>
                <div className="flex-1 mx-3 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400 rounded-full"
                    style={{ width: `${Math.min(Math.abs(s.drawdownPct), 100)}%` }}
                  />
                </div>
                <span className="w-16 text-right text-red-600 font-medium">
                  −{fmt(s.lossRupees)}
                </span>
                <span className="w-14 text-right text-gray-400 text-xs">
                  {s.drawdownPct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Context */}
        <p className="text-xs text-gray-400 leading-relaxed">
          {selected.event.description}
        </p>
      </div>

      {/* Comparison summary across all crashes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {replays.slice(0, 3).map(r => (
          <div key={r.event.id} className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">{r.event.name}</div>
            <div className="text-lg font-medium text-red-600">−{fmt(r.totalLoss)}</div>
            <div className="text-xs text-gray-400">{r.portfolioLossPct}% of portfolio</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4.3 ContagionMap.jsx

```jsx
// src/components/ContagionMap.jsx
import { useState, useMemo } from 'react';
import { simulateContagion } from '../lib/contagion';

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

export default function ContagionMap({ totalInvested, sectorExposure }) {
  const sectors = useMemo(() => Object.keys(sectorExposure), [sectorExposure]);
  const [triggerSector, setTriggerSector] = useState(sectors[0] ?? '');
  const [crashPct, setCrashPct] = useState(30);

  const result = useMemo(
    () => triggerSector
      ? simulateContagion(totalInvested, sectorExposure, triggerSector, crashPct)
      : null,
    [totalInvested, sectorExposure, triggerSector, crashPct]
  );

  if (!result) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-1">Contagion Map</h2>
        <p className="text-sm text-gray-500">
          When one sector crashes, correlated sectors fall too. This shows the real cascade.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">If</label>
          <select
            value={triggerSector}
            onChange={e => setTriggerSector(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
          >
            {sectors.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">drops</label>
          <input
            type="range"
            min="10"
            max="60"
            step="5"
            value={crashPct}
            onChange={e => setCrashPct(+e.target.value)}
            className="w-32"
          />
          <span className="text-sm font-medium text-gray-900 w-10">{crashPct}%</span>
        </div>
      </div>

      {/* Comparison: simple vs contagion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
          <div className="text-xs text-gray-500 mb-2">Simple model (one sector only)</div>
          <div className="text-2xl font-medium text-gray-900">−{fmt(result.simpleModelLoss)}</div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
          <div className="text-xs text-red-600 mb-2">With contagion (correlated sectors)</div>
          <div className="text-2xl font-medium text-red-700">−{fmt(result.totalLoss)}</div>
          {result.underestimation > 0 && (
            <div className="text-xs text-red-500 mt-1">
              Simple model underestimates by {fmt(result.underestimation)} ({result.underestimationPct}% more)
            </div>
          )}
        </div>
      </div>

      {/* Cascade visualization */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Crash cascade
        </h3>
        <div className="space-y-2">
          {result.cascade.map(c => (
            <div key={c.sector} className="flex items-center text-sm">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                c.type === 'direct' ? 'bg-red-500' : 'bg-amber-400'
              }`} />
              <span className="w-40 text-gray-700 truncate">
                {c.sector}
                {c.type === 'contagion' && (
                  <span className="text-xs text-gray-400 ml-1">
                    (ρ={c.correlation.toFixed(2)})
                  </span>
                )}
              </span>
              <div className="flex-1 mx-3 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.type === 'direct' ? 'bg-red-400' : 'bg-amber-300'}`}
                  style={{ width: `${Math.min(Math.abs(c.crashPct), 60) / 60 * 100}%` }}
                />
              </div>
              <span className="w-12 text-right text-gray-600 text-xs">−{c.crashPct}%</span>
              <span className="w-20 text-right text-red-600 font-medium">−{fmt(c.lossRupees)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plain English */}
      <p className="text-sm text-gray-600 leading-relaxed">
        When {triggerSector} drops {crashPct}%, it does not stay contained.{' '}
        {result.contagionLoss > 0
          ? `${result.cascade.filter(c => c.type === 'contagion').length} other sectors in your portfolio are dragged down too, adding ${fmt(result.contagionLoss)} in extra losses that a simple model would miss.`
          : 'However, your portfolio has no significant exposure to correlated sectors, which limits the cascade.'
        }
      </p>
    </div>
  );
}
```

### 4.4 FundSwapLab.jsx

```jsx
// src/components/FundSwapLab.jsx
import { useState, useMemo } from 'react';
import { rankReplacements, simulateSwap } from '../lib/fundSwap';

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

export default function FundSwapLab({ portfolio, allFunds }) {
  const [selectedFundIdx, setSelectedFundIdx] = useState(null);
  const [selectedReplacement, setSelectedReplacement] = useState(null);

  // Rank replacements when a fund is selected
  const candidates = useMemo(() => {
    if (selectedFundIdx === null) return [];
    return rankReplacements(portfolio, selectedFundIdx, allFunds);
  }, [portfolio, selectedFundIdx, allFunds]);

  // Compute swap result when a replacement is chosen
  const swapResult = useMemo(() => {
    if (selectedFundIdx === null || !selectedReplacement) return null;
    return simulateSwap(portfolio, selectedFundIdx, selectedReplacement);
  }, [portfolio, selectedFundIdx, selectedReplacement]);

  const shortName = name => name.split(' - ')[0].split(' Fund')[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-1">Fund Swap Lab</h2>
        <p className="text-sm text-gray-500">
          Pick a fund to replace and see exactly how it changes your portfolio risk.
        </p>
      </div>

      {/* Step 1: Pick fund to remove */}
      <div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Step 1: Which fund do you want to swap out?
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {portfolio.map((entry, i) => (
            <button
              key={entry.fund.schemeCode}
              onClick={() => {
                setSelectedFundIdx(i);
                setSelectedReplacement(null);
              }}
              className={`text-left p-3 rounded-xl border transition-colors text-sm ${
                selectedFundIdx === i
                  ? 'bg-red-50 border-red-300 text-red-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{shortName(entry.fund.name)}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {fmt(entry.amount)} · {entry.fund.category}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Replacement candidates */}
      {candidates.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Step 2: Pick a replacement ({portfolio[selectedFundIdx].fund.category} funds)
          </div>
          <div className="space-y-2">
            {candidates.map(c => (
              <button
                key={c.fund.schemeCode}
                onClick={() => setSelectedReplacement(c.fund)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selectedReplacement?.schemeCode === c.fund.schemeCode
                    ? 'bg-green-50 border-green-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {shortName(c.fund.name)}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{c.fund.category}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      c.delta.overlapChange < 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {c.delta.overlapChange > 0 ? '+' : ''}{c.delta.overlapChange}% overlap
                    </div>
                    {c.delta.crashLossSaved > 0 && (
                      <div className="text-xs text-green-500 mt-0.5">
                        Saves {fmt(c.delta.crashLossSaved)} in worst crash
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Before/After comparison */}
      {swapResult && (
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Impact of swapping {shortName(swapResult.removedFund)} → {shortName(swapResult.replacementFund)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="text-xs text-gray-500 mb-3">Current portfolio</div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400">Avg overlap</div>
                  <div className="text-xl font-medium text-gray-900">
                    {swapResult.before.avgOverlap}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Top sector ({swapResult.before.topSector})</div>
                  <div className="text-lg font-medium text-gray-900">
                    {swapResult.before.topSectorPct}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Worst 30% crash loss</div>
                  <div className="text-lg font-medium text-red-600">
                    −{fmt(swapResult.before.worstCrashLoss)}
                  </div>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="text-xs text-green-600 mb-3">After swap</div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-green-600/60">Avg overlap</div>
                  <div className="text-xl font-medium text-green-800">
                    {swapResult.after.avgOverlap}%
                    <span className={`text-sm ml-2 ${
                      swapResult.delta.overlapChange < 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      ({swapResult.delta.overlapChange > 0 ? '+' : ''}{swapResult.delta.overlapChange})
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-green-600/60">Top sector ({swapResult.after.topSector})</div>
                  <div className="text-lg font-medium text-green-800">
                    {swapResult.after.topSectorPct}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-green-600/60">Worst 30% crash loss</div>
                  <div className="text-lg font-medium text-green-800">
                    −{fmt(swapResult.after.worstCrashLoss)}
                    {swapResult.delta.crashLossSaved > 0 && (
                      <span className="text-sm text-green-600 ml-2">
                        (saves {fmt(swapResult.delta.crashLossSaved)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 4.5 RupeeAtRisk.jsx

```jsx
// src/components/RupeeAtRisk.jsx
import { varSummaryText } from '../lib/rupeeAtRisk';

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

export default function RupeeAtRisk({ varResult }) {
  if (!varResult) return null;

  const summary = varSummaryText(varResult);

  const tiers = [
    { ...varResult.var95, color: 'amber' },
    { ...varResult.var99, color: 'red' },
    { ...varResult.var999, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-1">Rupee-at-Risk</h2>
        <p className="text-sm text-gray-500">
          How much you could lose in a bad month, based on how volatile your sectors are.
        </p>
      </div>

      {/* Big headline number */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <div className="text-xs text-amber-600 uppercase tracking-wide mb-2">
          In a bad month (happens ~once every 2 years)
        </div>
        <div className="text-4xl font-medium text-amber-800">
          −{fmt(varResult.var95.rupees)}
        </div>
        <div className="text-sm text-amber-700 mt-2">
          That is {varResult.var95.pct}% of your {fmt(varResult.totalInvested)} portfolio
        </div>
      </div>

      {/* Three risk tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tiers.map(tier => (
          <div key={tier.label} className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">{tier.label}</div>
            <div className={`text-xl font-medium ${
              tier.color === 'amber' ? 'text-amber-600' : 'text-red-600'
            }`}>
              −{fmt(tier.rupees)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{tier.pct}% of portfolio</div>
          </div>
        ))}
      </div>

      {/* Volatility detail */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>Portfolio volatility:</span>
        <span className="font-medium text-gray-900">{varResult.annualVolPct}% annualised</span>
        <span className="text-gray-300">|</span>
        <span className="font-medium text-gray-900">{varResult.monthlyVolPct}% monthly</span>
      </div>

      {/* Plain English */}
      <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
        <p>{summary.headline}. {summary.detail}</p>
        <p>{summary.worstCase}</p>
      </div>
    </div>
  );
}
```

---

## 5. App.jsx Integration

Add the new imports and wire the new components into the existing results flow.

### 5.1 New imports at the top of App.jsx

```jsx
// Add these imports alongside existing ones
import { buildGhostPortfolio } from './lib/ghostPortfolio';
import { replayAllCrashes } from './lib/crashReplay';
import { computeRupeeAtRisk } from './lib/rupeeAtRisk';
import GhostPortfolio from './components/GhostPortfolio';
import CrashReplay from './components/CrashReplay';
import ContagionMap from './components/ContagionMap';
import FundSwapLab from './components/FundSwapLab';
import RupeeAtRisk from './components/RupeeAtRisk';
```

### 5.2 Updated runAnalysis function

Inside `App.jsx`, modify the `runAnalysis` function to compute new features:

```jsx
async function runAnalysis(port) {
  setIsAnalysing(true);
  setResults(null);
  setGeminiInsights(null);

  const overlap = analyseOverlap(port);
  const sectorExposure = computeSectorExposure(port);
  const eli5 = generateELI5(port, overlap, sectorExposure);
  const totalInvested = port.reduce((s, p) => s + p.amount, 0);

  // ── NEW: V2 features (all client-side, instant) ───────────────
  const ghost = buildGhostPortfolio(port);
  const crashReplays = replayAllCrashes(totalInvested, sectorExposure);
  const rupeeAtRisk = computeRupeeAtRisk(totalInvested, sectorExposure);
  // ContagionMap and FundSwapLab are interactive — they compute on user action
  // ───────────────────────────────────────────────────────────────

  setResults({
    totalInvested,
    portfolio: port,
    overlap,
    sectorExposure,
    eli5,
    // V2
    ghost,
    crashReplays,
    rupeeAtRisk,
  });
  setIsAnalysing(false);

  setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);

  // Async Gemini call (unchanged)
  setGeminiLoading(true);
  const insights = await fetchGeminiInsights(port, overlap, sectorExposure);
  setGeminiInsights(insights);
  setGeminiLoading(false);
}
```

### 5.3 Updated results section in JSX

```jsx
{results && (
  <div id="results" className="mt-12 space-y-12">
    {/* ── Existing sections ──────────────────────── */}
    <OverlapMatrix overlap={results.overlap} />
    <SectorChart sectorExposure={results.sectorExposure} />
    <CrashSimulator
      totalInvested={results.totalInvested}
      sectorExposure={results.sectorExposure}
    />
    <ELI5Section eli5={results.eli5} />
    <AIInsights insights={geminiInsights} loading={geminiLoading} />

    {/* ── V2: New sections ───────────────────────── */}
    <div className="border-t border-gray-100 pt-12">
      <h2 className="text-xl font-medium text-gray-900 mb-2">Deep Analysis</h2>
      <p className="text-sm text-gray-500 mb-8">
        Features no other Indian mutual fund tool offers.
      </p>

      <div className="space-y-12">
        <RupeeAtRisk varResult={results.rupeeAtRisk} />
        <GhostPortfolio ghost={results.ghost} />
        <CrashReplay replays={results.crashReplays} />
        <ContagionMap
          totalInvested={results.totalInvested}
          sectorExposure={results.sectorExposure}
        />
        <FundSwapLab portfolio={portfolio} allFunds={allFunds} />
      </div>
    </div>
  </div>
)}
```

---

## 6. Updated AI Insights Prompt

Modify the Gemini prompt in `server.js` to include the new data:

```javascript
const prompt = `You are a friendly Indian mutual fund analyst explaining portfolio analysis to a beginner investor. Be direct, specific, use rupee amounts. No jargon. Max 2 sentences per field.

Portfolio:
${portfolioSummary}

Fund overlap:
${overlapSummary}

Sector exposure:
${sectorSummary}

Ghost portfolio insight: The investor holds ${ghostSummary.totalStocks} unique stocks, ${ghostSummary.redundantStocks} appear in 2+ funds. HHI concentration index is ${ghostSummary.hhi}. Effective TER is ${ghostSummary.effectiveTER}%.

Rupee-at-Risk: In a bad month, this portfolio could lose up to ₹${varSummary.var95Rupees}.

Replacement funds available (same category, not in portfolio): ${availableFunds}

Respond ONLY with valid JSON, no markdown fences:
{
  "concentrated": "Which sector or stock is too concentrated and why it matters in simple terms.",
  "redundant": "Which fund pair overlaps most and what the investor should know.",
  "recommendation": "One specific action — name a fund to reduce and a replacement to consider, with a one-line reason.",
  "ghostInsight": "One sentence about what the merged ghost portfolio reveals (e.g. paying high fees for index-like returns).",
  "riskInsight": "One sentence putting the rupee-at-risk number in everyday context (e.g. that is X months of SIP contributions)."
}`;
```

---

## 7. Required Data Addition: Fund TER

Add a `ter` field (Total Expense Ratio as %) to each fund in `backend/data/funds.json`:

```json
{
  "schemeCode": "120503",
  "name": "Axis Bluechip Fund - Direct Growth",
  "category": "Large Cap",
  "ter": 0.49,
  "holdings": [...],
  "sectorWeights": {...}
}
```

Typical direct plan TERs for your 20 funds:

| Fund | TER (%) |
|---|---|
| Axis Bluechip | 0.49 |
| Mirae Asset Large Cap | 0.53 |
| SBI Bluechip | 0.62 |
| Parag Parikh Flexi Cap | 0.63 |
| HDFC Mid-Cap Opportunities | 0.74 |
| Nippon India Small Cap | 0.68 |
| SBI Small Cap | 0.65 |
| (others) | 0.45 – 0.80 |

These are approximate. Look up exact current TERs from AMFI monthly factsheets.

---

## 8. Build Order (6–8 hours)

| Hours | Task | Files |
|---|---|---|
| 0:00 – 0:30 | Create all 3 data files. Add `ter` field to `funds.json` | `historicalCrashes.js`, `sectorCorrelations.js`, `sectorVolatility.js`, `funds.json` |
| 0:30 – 1:30 | `ghostPortfolio.js` — build + test with console.log against Demo 1. Verify HHI, merged holdings, TER computation | `ghostPortfolio.js` |
| 1:30 – 2:00 | `crashReplay.js` — test against Demo 1, verify COVID crash loss matches expected range | `crashReplay.js` |
| 2:00 – 2:45 | `contagion.js` — test Banking 30% crash cascade with Demo 1. Verify NBFC, Financial Services get hit | `contagion.js` |
| 2:45 – 3:15 | `fundSwap.js` — test swapping Axis Bluechip with any other fund, verify overlap delta | `fundSwap.js` |
| 3:15 – 3:45 | `rupeeAtRisk.js` — test VaR computation. Verify numbers are reasonable (VaR95 should be 5–15% of portfolio) | `rupeeAtRisk.js` |
| 3:45 – 4:30 | `RupeeAtRisk.jsx` — big number + 3 tiers + plain English | `RupeeAtRisk.jsx` |
| 4:30 – 5:15 | `GhostPortfolio.jsx` — stat cards + top 20 table + fee comparison | `GhostPortfolio.jsx` |
| 5:15 – 6:00 | `CrashReplay.jsx` — event selector + damage breakdown | `CrashReplay.jsx` |
| 6:00 – 6:45 | `ContagionMap.jsx` — sector picker + slider + cascade bars | `ContagionMap.jsx` |
| 6:45 – 7:30 | `FundSwapLab.jsx` — 3-step flow + before/after + candidate ranking | `FundSwapLab.jsx` |
| 7:30 – 8:00 | Wire into `App.jsx`, update Gemini prompt, test all 3 demos end-to-end | `App.jsx`, `server.js` |

**Critical path:** Data files first → lib files second (test each in isolation) → components third → integration last.

---

## 9. Testing Checklist

### Ghost Portfolio
- [ ] Demo 1 (High): HDFC Bank appears as #1 stock, heldBy.length === 3
- [ ] Demo 1: HHI > 2500 (concentrated)
- [ ] Demo 3 (Low): HHI < 1000 (diversified)
- [ ] Demo 1: excessFee > 0, shows fee comparison card
- [ ] Top 20 table renders, sorted by effective weight

### Crash Replay
- [ ] COVID crash shows largest loss for Demo 1 (Banking-heavy)
- [ ] 2008 GFC shows the largest absolute loss across all events
- [ ] Event pills are clickable, sector bars update
- [ ] Loss numbers are in rupees, not just percentages

### Contagion Map
- [ ] Banking crash triggers NBFC, Financial Services, Insurance cascade
- [ ] IT crash shows minimal contagion (few correlated sectors)
- [ ] "Simple model underestimates by X" appears for Banking crash
- [ ] Slider updates cascade in real time

### Fund Swap Lab
- [ ] Selecting a fund shows 1–5 replacement candidates
- [ ] Candidates are from the same category only
- [ ] Before/after overlap numbers are different
- [ ] Green = improvement, red = worse
- [ ] Works with 2-fund and 3-fund portfolios

### Rupee-at-Risk
- [ ] VaR95 is roughly 5–15% of total invested (sanity check)
- [ ] VaR99 > VaR95 > 0
- [ ] Demo 3 (Low) has lower VaR than Demo 1 (High)
- [ ] Plain English summary reads at grade 8 level

---

## 10. Demo Script Addition (Extra 60 seconds)

After the existing 90-second demo:

7. Scroll to **Rupee-at-Risk** — say: "Institutions call this Value at Risk. We call it 'how much you could lose in a bad month' — in rupees."
8. Scroll to **Ghost Portfolio** — say: "Three fund names. But look — they actually own the same 15 stocks. And they are paying ₹4,200 more in fees than a single index fund."
9. Scroll to **Crash Replay**, click COVID-19 — say: "This isn't hypothetical. In March 2020, this portfolio would have lost ₹62,000 in 23 days. We replayed the actual crash."
10. Scroll to **Contagion Map** — say: "No other tool in India shows this. When banking crashes, it doesn't stay in banking. NBFC, insurance, housing finance — they all fall together."
11. Scroll to **Fund Swap Lab**, click a fund, pick a replacement — say: "And here's the fix. Swap this one fund — overlap drops from 67% to 41%, crash loss shrinks by ₹11,000. Proof, not advice."
