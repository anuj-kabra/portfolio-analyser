# Product Requirements Document — V2.2
## MF Portfolio Analyzer — Deepening the Five Features

**Version:** 2.2  
**Date:** March 18, 2026  
**Status:** Hackathon MVP — Feature Depth Extension  
**Builds on:** PRD v2.1 (all 5 deep analysis features working)  

---

## 1. Product Overview

### 1.1 What V2.1 built
Five new analysis sections: Ghost Portfolio, Crash Replay, Contagion Map, Fund Swap Lab, and Rupee-at-Risk. Each section shows a headline insight and supporting data.

### 1.2 What V2.2 solves
V2.1 features are currently one layer deep. They present the headline number but leave the investor with follow-up questions that have no answer:

| Feature | Investor's follow-up question | Currently unanswered |
|---|---|---|
| Ghost Portfolio | "HDFC Bank is in all 3 funds — so what?" | What happens if that one stock drops? |
| Ghost Portfolio | "Am I really worse than just buying Nifty?" | No direct comparison exists |
| Crash Replay | "Okay I lost ₹2,10,000 — but when do I recover?" | No recovery data |
| Crash Replay | "Which of my 3 funds hurt me the most?" | Loss isn't attributed per fund |
| Contagion Map | "Which sector should I worry about most?" | User has to guess which sector to simulate |
| Fund Swap Lab | "I don't want a new fund — can I just move money?" | Only swaps, no rebalancing |
| Fund Swap Lab | "My friend said to add Quant Small Cap — should I?" | No way to test adding a fund |
| Rupee-at-Risk | "Nifty dropped 3% today — how bad is it for me?" | No real-time input |
| Rupee-at-Risk | "₹47,000 — what does that actually mean for my life?" | Not connected to SIP or goals |

V2.2 answers every one of these questions inside the existing 5 sections. No new sections. No new page areas. Same UI layout — just deeper.

### 1.3 Architecture impact
- **No new components.** All enhancements are additions within existing `.jsx` files.
- **No new lib files.** All new computations are added as functions within existing lib files.
- **One new data file:** `niftyBenchmark.js` — Nifty 50 sector weights and top-10 stock weights.
- **One new data file:** `sectorBetas.js` — sector beta multipliers vs Nifty for Panic Mode.
- **One new data file:** `crashRecovery.js` — per-sector recovery months for each historical event.
- **Backend:** No changes. Gemini prompt can optionally be enriched further but not required.

---

## 2. User Flow (unchanged)

The page layout is identical to V2.1. Each of the 5 deep analysis sections gains new sub-sections within itself. The user scrolls through the same sections — they are simply richer.

---

## 3. Feature Deepening Specifications

### 3.1 Ghost Portfolio — 4 additions

#### 3.1A Single-Stock Stress Test

**What it answers:** "If HDFC Bank drops 20%, how much do I lose — across all my funds combined?"

**Position:** Below the top-20 holdings table, within the Ghost Portfolio section.

**UI:**
- Dropdown: pre-populated with the top 10 ghost portfolio stocks (default: #1 stock)
- Slider: 10%–50% drop (default: 20%)
- Live-updating result line:
  > "If **HDFC Bank** drops **20%**, you lose **₹9,400** — this stock is in all 3 of your funds and there is no way to escape this loss without reducing overlap."

**Computation:** `selectedStock.effectiveWeight × totalInvested × crashPct / 10000`

**Demo 1 expected numbers:**

| Stock | Weight | 20% drop loss | 30% drop loss |
|---|---|---|---|
| HDFC Bank | 9.4% | ₹9,400 | ₹14,100 |
| Infosys | 7.8% | ₹7,800 | ₹11,700 |
| Reliance | 6.2% | ₹6,200 | ₹9,300 |

**Why this matters:** The investor sees overlap as abstract percentages until they realize one company controls 9.4% of their money across all funds and they can't diversify away from it.

---

#### 3.1B Nifty 50 Shadow Comparison

**What it answers:** "Is my 3-fund portfolio actually better than just buying one index fund?"

**Position:** Below the fee comparison card, within Ghost Portfolio section.

**UI:** Side-by-side comparison table:

| Metric | Your Ghost Portfolio | Nifty 50 Index Fund |
|---|---|---|
| Unique stocks | 28 | 50 |
| HHI (concentration) | 2,847 — Concentrated | ~680 — Diversified |
| Top stock weight | 9.4% (HDFC Bank) | ~7.2% (HDFC Bank) |
| Max sector exposure | 26.6% (Banking) | ~31% (Financial Svcs) |
| Annual fee on ₹5L | ₹4,700 | ₹500 |
| VaR 95% | ₹47,000 | ~₹38,000 |

**Data source:** New file `niftyBenchmark.js` — hardcoded from NSE's Nifty 50 factsheet. Updated once. Static.

**Verdict line below the table (template-based):**
- If ghost HHI > Nifty HHI and ghost fee > Nifty fee: "Your portfolio is **more concentrated** and **9x more expensive** than a single Nifty 50 index fund. You are paying more for less diversification."
- If ghost HHI < Nifty HHI: "Your portfolio is genuinely more diversified than Nifty 50 — your multi-fund approach is working."

---

#### 3.1C Fund Contribution Score

**What it answers:** "Which of my funds is earning its keep, and which is freeloading?"

**Position:** Below the Nifty 50 comparison, within Ghost Portfolio section. Shown as a compact bar chart or stat cards — one per fund.

**Computation per fund:**
1. Count stocks unique to this fund (not in any other fund)
2. Count sectors unique to this fund (>5% weight in a sector no other fund covers)
3. `contributionScore = (uniqueStocks / totalUniqueStocksAcrossAllFunds) × 100`

**Display:**

| Fund | Contribution | Unique Stocks | Annual Fee |
|---|---|---|---|
| Parag Parikh Flexi Cap | **62%** | 18 stocks | ₹1,260 |
| HDFC Mid-Cap | **30%** | 12 stocks | ₹1,110 |
| Axis Bluechip | **8%** | 2 stocks | ₹735 |

**Plain-English verdict:**
> "Axis Bluechip costs ₹735/year but contributes only 8% of your diversification — almost everything it holds is already in your other funds. Parag Parikh contributes 62% and is your most valuable fund."

---

#### 3.1D Market-Cap Breakdown

**What it answers:** "Am I actually spread across large, mid, and small caps — or is it all one size?"

**Position:** Below the stat cards row, within Ghost Portfolio. Small horizontal stacked bar.

**Computation:** Each holding in the ghost portfolio is tagged as Large Cap (top 100 by market cap), Mid Cap (101–250), or Small Cap (251+). The tag comes from `funds.json` — each holding already has a sector field; add a `capCategory` field or derive from the fund's category.

**Simplified approach for hackathon:** Use the fund's SEBI category as proxy. A holding from a "Large Cap" fund is counted as large cap. A holding from a "Small Cap" fund is counted as small cap. Holdings from "Flexi Cap" funds use the fund's own allocation split (hardcode from factsheet: e.g., Parag Parikh is ~65% large, ~20% mid, ~15% small).

**Display:** Single stacked bar showing: Large Cap 72% | Mid Cap 18% | Small Cap 10%

**Demo 1 expected:** ~92% large cap, ~8% mid cap, ~0% small cap — because all 3 funds are large-cap. The visual instantly shows the market-cap concentration.

---

### 3.2 Crash Replay — 3 additions

#### 3.2A Recovery Timeline

**What it answers:** "After COVID, how many months until my money came back?"

**Position:** Below the big loss number, within the selected crash event card.

**UI:** A single prominent line:
> "Estimated recovery: **14 months** to return to pre-crash levels."

Below it, a comparison:
> "A well-diversified portfolio (like Demo 3) would have recovered in **9 months** — 5 months faster."

**Data source:** New file `crashRecovery.js` — per-sector recovery months for each of the 5 events. Hardcoded from NSE sector index data.

**Computation:** Weighted average of sector recovery months, using the user's sector exposure as weights:
```
portfolioRecoveryMonths = Σ(sectorWeight × sectorRecoveryMonths) / Σ(sectorWeight)
```

**Expected numbers for COVID crash:**

| Sector | Recovery months |
|---|---|
| Banking | 11 |
| IT | 7 |
| Pharma | 4 |
| FMCG | 6 |
| Auto | 13 |
| Metals | 10 |
| Realty | 18 |
| Small Cap (broad) | 16 |

Demo 1 (banking-heavy): ~12–14 months. Demo 3 (small-cap heavy but diversified): ~9–11 months.

---

#### 3.2B Per-Fund Loss Attribution

**What it answers:** "Which of my 3 funds hurt me the most in this crash?"

**Position:** Below the sector-by-sector damage bars, within the crash event card.

**UI:** Small stat cards, one per fund:

| Axis Bluechip | HDFC Mid-Cap | Parag Parikh |
|---|---|---|
| −₹86,000 (43%) | −₹58,000 (39%) | −₹66,000 (33%) |
| Worst hit: Banking −43% | Worst hit: Auto −42% | Worst hit: IT −29% |

**Computation per fund:**
```
For each fund in portfolio:
  fundLoss = 0
  For each [sector, drawdown] in crashEvent.sectorDrawdowns:
    sectorWeight = fund.sectorWeights[sector] ?? 0
    fundLoss += (sectorWeight / 100) × fund.amount × (|drawdown| / 100)
  fundLossPct = fundLoss / fund.amount × 100
```

**Why this matters:** Directly connects a crash to a specific fund — bridging to Fund Swap Lab. "Axis Bluechip lost 43% in COVID. If you had swapped it before the crash, you'd have saved ₹22,000."

---

#### 3.2C Portfolio vs Nifty During Crash

**What it answers:** "Did I do worse or better than the market?"

**Position:** Single line below the big loss number, within the crash event card.

**UI:**
> "Nifty fell **38.0%**. Your portfolio fell **42.3%**. You did **4.3 percentage points worse** than the market — because of your banking overweight."

Or for Demo 3:
> "Nifty fell **38.0%**. Your portfolio fell **31.2%**. You did **6.8 percentage points better** — your diversification protected you."

**Computation:** Compare `portfolioLossPct` (already computed) against `event.niftyDrawdown` (already in `historicalCrashes.js`).

**Color:** Red text if worse than Nifty. Green text if better.

---

### 3.3 Contagion Map — 3 additions

#### 3.3A Worst-Trigger Auto-Detection

**What it answers:** "Which sector crash would hurt me the most, including cascade effects?"

**Position:** Above the sector dropdown (replaces the default selection logic), within Contagion Map.

**Behavior:** On analysis load, run `simulateContagion` for every sector the user has >3% exposure to, at 30% crash severity. Find the one with the highest `totalLoss`. Pre-select it in the dropdown.

**UI addition:** A line above the controls:
> "Your most dangerous trigger is **Banking** — a 30% crash cascades to 4 other sectors, costing **₹53,200 total**."

Show a mini ranking of top 3 worst triggers as clickable pills:
```
[ Banking: ₹53,200 ]  [ IT: ₹42,100 ]  [ Auto: ₹28,600 ]
```

Clicking a pill selects that sector in the dropdown and updates the cascade.

---

#### 3.3B Safe-Haven Highlight

**What it answers:** "Is anything in my portfolio protected from this crash?"

**Position:** Below the cascade bars, within Contagion Map.

**UI:** A green-tinted card (only appears if safe-haven sectors exist):
> "**Unaffected by this crash:** Pharma (₹18,000) and FMCG (₹14,000) are not correlated with Banking. These ₹32,000 are your portfolio's shock absorbers."

If no safe havens:
> "**Warning:** Every sector in your portfolio is connected to Banking. You have no shock absorbers — a banking crash hits your entire portfolio."

**Computation:** After running `simulateContagion`, identify sectors in the user's portfolio that are NOT in the cascade array (neither direct nor contagion). Sum their rupee exposure.

---

#### 3.3C Contagion-Adjusted Crash Replay

**What it answers:** "In COVID, how much worse was it when sectors dragged each other down?"

**Position:** Within Crash Replay section. Add a toggle switch next to the event selector:
```
[ Simple model ]  [ With contagion ● ]
```

**Behavior when toggled to "With contagion":**
- For each sector hit in the crash, check if any other sectors have a correlation > 0.5 with it
- If sector A fell 43% and sector B has ρ=0.88 with A, check if B's actual historical drawdown was LESS than what the correlation model predicts. If so, use the actual. If the correlation model predicts a worse outcome, use the model.
- This represents a "what if the contagion was even worse than what actually happened" stress scenario

**UI change:** The big loss number updates. Show both:
> "Simple model: **−₹2,10,000**. With contagion stress: **−₹2,38,000**."
> "The interconnection between your banking, NBFC, and insurance holdings makes it ₹28,000 worse."

---

### 3.4 Fund Swap Lab — 3 additions

#### 3.4A Rebalance Mode (No New Fund)

**What it answers:** "Can I fix my portfolio just by moving money between my existing funds?"

**Position:** Top of Fund Swap Lab. A toggle switch:
```
[ Swap a fund ]  [ Rebalance amounts ● ]
```

**UI in rebalance mode:**
- One slider per fund, showing current amount. Sliders are linked — total stays constant.
- Example: Axis Bluechip slider at ₹1,50,000 ←→ Parag Parikh slider at ₹2,00,000
- As user drags, live-update: overlap %, top sector %, VaR95
- Show delta from current: "Overlap: 67.5% → 54.2% (−13.3)"

**Below sliders, "Optimize for me" button:**
- Brute-force 100 allocation splits (same funds, same total, varying proportions in ₹10,000 steps)
- Find the split that minimizes: `(avgOverlap × 0.6) + (maxSectorPct × 0.4)`
- Show result: "Optimal split: Axis ₹80,000, Parag Parikh ₹2,70,000, HDFC Mid-Cap ₹1,50,000. Overlap drops from 67% to 52%."

---

#### 3.4B Fitment Check (Add a Fund)

**What it answers:** "My friend recommended Quant Small Cap. Should I add it?"

**Position:** Top of Fund Swap Lab. A third toggle option:
```
[ Swap a fund ]  [ Rebalance ]  [ Test adding a fund ● ]
```

**UI:**
- Search dropdown (same as portfolio input) to pick a fund
- Amount field: "How much would you invest?" (₹)
- On selection, the engine temporarily adds this fund+amount to the portfolio and reruns all analysis

**Display:**
- Before/after comparison (same style as swap before/after):
  | | Current | After adding |
  |---|---|---|
  | Avg overlap | 13.3% | 22.1% (+8.8) |
  | Top sector | IT 16.8% | Metals 19.4% |
  | VaR 95% | ₹35,000 | ₹43,200 (+₹8,200) |
  | Total invested | ₹5,00,000 | ₹6,00,000 |

- Verdict card:
  - **Green:** "This fund adds genuine diversification. It brings 24 stocks you don't currently hold and adds exposure to Metals and Chemicals."
  - **Amber:** "This fund partially overlaps with your portfolio. It adds some new exposure but increases your IT concentration."
  - **Red:** "This fund duplicates what you already own. 71% of its holdings are already in your portfolio."

**Verdict logic:**
- Green: overlap of new fund with existing portfolio < 20% AND it adds at least 2 new sectors with >5% weight
- Amber: overlap 20–40% OR it adds 1 new sector
- Red: overlap > 40% OR it adds no new sectors

---

#### 3.4C Amount Optimizer

**What it answers:** "What's the best way to split my money across my existing funds?"

**Position:** Within Rebalance Mode, activated by "Optimize for me" button.

**Computation:**
1. Hold fund selection constant. Hold total investment constant.
2. Generate all allocation combinations in ₹10,000 steps where each fund gets at least ₹50,000
3. For each combination, compute `analyseOverlap` and `computeSectorExposure`
4. Score = `avgOverlap × 0.6 + maxSectorExposurePct × 0.4` (lower is better)
5. Return the top-scoring allocation

**Performance:** For 3 funds with total ₹5,00,000 in ₹10,000 steps, there are ~1,000 valid combinations. Each runs `analyseOverlap` (fast — just Map lookups). Total computation < 500ms.

**Display:** Replace slider positions with optimal values. Show improvement:
> "Optimal allocation found. Overlap drops from **67.5%** to **52.1%** just by changing how much you put in each fund."

---

### 3.5 Rupee-at-Risk — 3 additions

#### 3.5A Panic Mode ("Market dropped today")

**What it answers:** "Nifty fell 3% today. How much did I lose?"

**Position:** Top of the Rupee-at-Risk section. A single input field:
```
Nifty dropped [___]% today    →   Your estimated loss: ₹14,600
```

**Computation:**
- Use sector beta multipliers from new `sectorBetas.js` (e.g., Banking beta 1.3 means if Nifty drops 3%, banking drops ~3.9%)
- For each sector: `sectorDrop = niftyDrop × sectorBeta`
- Loss = `Σ(sectorExposure[sector].rupeeAmount × sectorDrop / 100)`

**Below the loss number, context line:**
> "This is **31%** of your monthly VaR (₹47,000). This is normal market volatility, not a crisis."

**Color logic:**
- Loss < 30% of VaR95 → green context: "Normal day. Don't worry."
- Loss 30–60% of VaR95 → amber: "A rough day, but within expected range."
- Loss > 60% of VaR95 → red: "A significant drop. Check if your diversification is working."

**Expected numbers for Demo 1, Nifty −3%:**
- Banking (26.6% exposure, beta 1.3): drops 3.9% → loss ₹5,187
- IT (24.9%, beta 0.9): drops 2.7% → loss ₹3,361
- Other sectors: combined ~₹5,500
- Total: ~₹14,000

---

#### 3.5B SIP Months Lost

**What it answers:** "₹47,000 sounds abstract — what does it mean for my SIP?"

**Position:** Below the VaR95 big number card, as an additional context line.

**UI:** A small input field:
> "Your monthly SIP: ₹[10,000]"
> "A bad month would wipe out **4.7 months** of your SIP contributions."

Default estimate if user doesn't enter: `totalInvested / 36` (assumes 3-year SIP history).

**Computation:** `sipMonthsLost = var95.rupees / monthlySIPAmount`

**Why this matters:** Losing ₹47,000 is one thing. "5 months of ₹10,000 payments — gone in one bad month" hits differently because the investor physically remembers making those payments every month.

---

#### 3.5C Risk Budget Per Fund

**What it answers:** "Which fund is making my portfolio riskier?"

**Position:** Below the three VaR tier cards, within Rupee-at-Risk section.

**Computation per fund:**
- Compute VaR for the full portfolio (existing)
- For each fund, compute VaR for the portfolio *without* that fund
- Fund's risk contribution = `fullPortfolioVaR - portfolioVaRWithoutThisFund`
- Normalize to percentages

**Display:** Horizontal bars, one per fund:

| Fund | Risk Contribution | Investment Share | Verdict |
|---|---|---|---|
| Axis Bluechip | **42%** of risk | 30% of money | ⚠️ Disproportionate |
| HDFC Mid-Cap | **33%** of risk | 30% of money | Proportionate |
| Parag Parikh | **25%** of risk | 40% of money | ✓ Efficient |

**Verdict logic:**
- If risk % > investment % + 10 points → "⚠️ Disproportionate — this fund adds more risk than its weight"
- If risk % ≈ investment % (within 10 points) → "Proportionate"
- If risk % < investment % − 10 points → "✓ Efficient — this fund is dampening your portfolio risk"

**Connection to Fund Swap Lab:** Below the risk budget, show:
> "Axis Bluechip contributes 42% of your risk but only 30% of your money. Consider swapping or reducing it in the Fund Swap Lab above."

---

## 4. Expected Numbers for All 3 Demos

### Demo 1 — "The Classic Mistake"

| Enhancement | Expected Value |
|---|---|
| Ghost: HDFC Bank 20% drop | −₹9,400 across all funds |
| Ghost: vs Nifty 50 HHI | 2,847 vs ~680. More concentrated. |
| Ghost: vs Nifty 50 fee | ₹4,700 vs ₹500. 9x more expensive. |
| Ghost: Axis Bluechip contribution | ~8% diversification, ₹735 fee |
| Ghost: Market cap | ~92% large cap |
| Crash: COVID recovery | ~14 months |
| Crash: Axis Bluechip COVID loss | −₹86,000 (43%) — worst among 3 |
| Crash: Portfolio vs Nifty (COVID) | Fell 42% vs Nifty 38%. 4pt worse. |
| Contagion: Worst trigger | Banking → ₹53,200 total |
| Contagion: Safe havens | Pharma + FMCG = ₹32,000 protected |
| Swap Lab: Rebalance best split | Axis ₹80K, others adjusted. Overlap → 52%. |
| Swap Lab: Fitment of Quant Small Cap | Green — adds Metals/Chemicals, 7% overlap |
| VaR: Panic mode (Nifty −3%) | ~₹14,000 loss. 30% of VaR. Normal. |
| VaR: SIP months lost (₹10K SIP) | 4.7 months wiped |
| VaR: Risk budget | Axis contributes 42% of risk with 30% of money |

### Demo 3 — "The Well-Diversified"

| Enhancement | Expected Value |
|---|---|
| Ghost: HDFC Bank 20% drop | −₹2,800 (much lower single-stock risk) |
| Ghost: vs Nifty 50 HHI | ~750 vs ~680. Comparable. ✓ |
| Ghost: Axis Bluechip contribution | N/A — different funds |
| Crash: COVID recovery | ~9 months (5 months faster than Demo 1) |
| Crash: Portfolio vs Nifty (COVID) | Fell 31% vs Nifty 38%. 7pt better. |
| Contagion: Worst trigger | IT → ₹28,000 (much lower cascade) |
| Contagion: Safe havens | ₹48,000+ in uncorrelated sectors |
| VaR: Panic mode (Nifty −3%) | ~₹9,200 loss vs Demo 1's ₹14,000 |
| VaR: SIP months lost | 3.1 months vs Demo 1's 4.7 |

---

## 5. Design Principles (additions to V2.1)

- **Enhancements live inside their parent section.** No new scroll destinations. No new section headers. Each addition appears as a sub-card or sub-area within the existing component.
- **Interactive additions (sliders, dropdowns, toggles) are always above the data they control.** Control → then result. Never the reverse.
- **Toggle switches use consistent styling.** Three-option toggle in Fund Swap Lab: pill-style buttons, active state = filled, inactive = outline.
- **Context lines connect sections.** Risk Budget says "Consider swapping in Fund Swap Lab above." Per-fund crash attribution says "This fund lost the most — test a replacement in Fund Swap Lab." These cross-links keep the user moving through the tool.
- **Every number has a comparison.** "14 months" alone is meaningless. "14 months — vs 9 months for a diversified portfolio" is actionable. "₹14,000 loss" alone is scary. "₹14,000 — 31% of your VaR, this is normal" is calming.

---

## 6. Updated Demo Script (additions to V2.1 script)

After the existing V2.1 demo points:

12. In **Ghost Portfolio**, click HDFC Bank stress test — say: "One stock. 9.4% of their entire portfolio. If HDFC Bank drops 20%, they lose ₹9,400 — and they can't avoid it because it's in all 3 funds."
13. Point to Nifty comparison — say: "This portfolio is more concentrated AND 9x more expensive than one index fund. Three funds doing worse than one."
14. In **Crash Replay**, toggle "COVID" — point to recovery: "₹2,10,000 lost. 14 months to recover. A diversified portfolio? 9 months. That's 5 extra months of being underwater."
15. Point to per-fund loss: "Axis Bluechip alone lost ₹86,000. That's 43% of its value. The data tells you exactly which fund to fix."
16. In **Contagion Map** — point to auto-detected worst trigger: "The tool already found it. Banking is your most dangerous sector. Not because we guessed — because we tested every sector."
17. In **Fund Swap Lab**, click "Rebalance" — drag slider: "They don't even need a new fund. Just move ₹50,000 from Axis to Parag Parikh. Overlap drops 13 points. Proof."
18. In **Rupee-at-Risk**, type "3" in panic mode: "Nifty dropped 3% today. Their portfolio lost ₹14,000. But their VaR says a bad month is ₹47,000 — this is 31%. Normal volatility. Don't panic."

---

## 7. Non-Goals

- No new sections or components
- No new API endpoints
- No real-time market data integration (Panic Mode uses manual input, not live feed)
- No portfolio optimization algorithm beyond brute-force (acceptable for ≤6 funds, ≤20 fund universe)
- No user-configurable risk tolerance or goal-planning (Panic Mode and SIP Months Lost are contextual, not planning tools)
