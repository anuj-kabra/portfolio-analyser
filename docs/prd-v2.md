# Product Requirements Document — V2.1
## MF Portfolio Analyzer — Ghost Portfolio, Crash Replay, Contagion Map, Fund Swap Lab, Rupee-at-Risk

**Version:** 2.1  
**Date:** March 18, 2026  
**Status:** Hackathon MVP — Deep Analysis Extension  
**Builds on:** PRD v2.0 (all original features working and deployed)  

---

## 1. Product Overview

### 1.1 Updated one-line pitch
A free web tool that tells Indian mutual fund investors — in plain language — whether their portfolio is secretly concentrated, what a real market crash would actually cost them in rupees, how a sector crash cascades to other sectors, and exactly which fund to swap and what it fixes — with proof.

### 1.2 What V2.0 solved
V2.0 tells the investor they have a problem — 67% overlap, 26% banking exposure, ₹39,934 at risk. It diagnoses.

### 1.3 What V2.1 solves
V2.1 goes five levels deeper. It shows the investor:
1. **What they actually own** — not fund names, the real stock-level portfolio behind all their funds
2. **What would have happened in real crashes** — not hypothetical 30% drops, actual March 2020, IL&FS, demonetization scenarios replayed against their exact portfolio
3. **How a crash spreads** — when banking drops, NBFC, insurance, and housing finance drop too. No Indian tool shows this cascade
4. **Exactly what to fix and proof it works** — pick a fund to swap, see the before/after overlap, sector concentration, and crash loss change in real time
5. **A single risk number in rupees** — institutional VaR translated into "in a bad month, you could lose ₹47,000"

### 1.4 Why no Indian tool has built this
Every existing overlap tool in India (Dezerv, PrimeInvestor, freefincal, BusinessToday, AdvisorKhoj, InvestYadnya, thefundoo) does the same thing: pairwise overlap between 2 funds → Venn diagram → common stock list. That is it. None of them:
- Merge holdings into a ghost portfolio
- Replay real historical crashes
- Model cross-sector contagion
- Let the user simulate fund swaps with proof
- Compute a portfolio-level risk number in rupees

This is the gap. V2.1 fills it.

### 1.5 Architecture (unchanged)
- **Frontend:** React + Vite — all 5 new features compute client-side (no new API endpoints)
- **Backend:** Node.js + Express — only change: `ter` field added to `funds.json`, Gemini prompt updated
- **AI:** Google Gemini 1.5 Flash via backend proxy (now receives ghost + VaR data for richer insights)
- **Deploy:** Frontend on Vercel, Backend on Railway (both free tier)

---

## 2. Updated User Flow

```
Landing page (unchanged)
    │
    ├── Three demo buttons
    └── Manual input
    │
    ▼
Results (auto-scroll)
    ├── Section 1: Overlap Matrix                ← existing
    ├── Section 2: Sector Chart + Crash Sim      ← existing
    ├── Section 3: ELI5 Summary                  ← existing
    ├── Section 4: AI Insights (Gemini)          ← existing, updated prompt
    │
    ├── ──── "Deep Analysis" divider ──────────
    │
    ├── Section 5: Rupee-at-Risk                 ★ NEW
    ├── Section 6: Ghost Portfolio               ★ NEW
    ├── Section 7: Historical Crash Replay       ★ NEW
    ├── Section 8: Contagion Map                 ★ NEW
    └── Section 9: Fund Swap Lab                 ★ NEW
```

**Section ordering rationale:**
- Rupee-at-Risk comes first because it is a single dramatic number — hooks the user instantly
- Ghost Portfolio second because it is the "oh, I see" moment — they understand what they truly own
- Crash Replay third because it is emotional — real events, real losses
- Contagion Map fourth because it deepens the crash understanding
- Fund Swap Lab last because it is the resolution — the fix, with proof

---

## 3. Demo Portfolio — Expected Numbers for V2.1 Features

These numbers are what the 5 new features should produce for each demo. Use them for testing and judge walkthroughs.

### Demo 1 — "The Classic Mistake" (High Overlap)

| Feature | Key Number | What it means |
|---|---|---|
| Ghost Portfolio — unique stocks | ~25–30 | Three funds, but only 25–30 distinct stocks after merging |
| Ghost Portfolio — in all 3 funds | ~12–15 | These stocks appear in all three funds |
| Ghost Portfolio — HHI | >2500 | "Concentrated" — comparable to holding just 4–5 individual stocks |
| Ghost Portfolio — excess fee vs index | ~₹3,000–5,000/yr | Paying 3x the fees for an index-like portfolio |
| Crash Replay — COVID March 2020 | ~₹1,80,000–2,10,000 | 36–42% portfolio loss |
| Crash Replay — IL&FS 2018 | ~₹85,000–95,000 | Banking-heavy = maximum NBFC contagion |
| Crash Replay — 2008 GFC | ~₹2,80,000–3,10,000 | Catastrophic — 56–62% loss |
| Contagion — Banking 30% crash | Simple: ~₹39,934. With contagion: ~₹52,000–58,000 | Simple model misses ₹12,000–18,000 |
| Contagion — cascade sectors hit | NBFC, Financial Services, Insurance, Realty | 4 sectors dragged down |
| Rupee-at-Risk — VaR 95% (bad month) | ~₹35,000–50,000 | Once every ~2 years |
| Rupee-at-Risk — VaR 99% (worst month) | ~₹50,000–70,000 | Once per decade |
| Fund Swap Lab — best swap | Axis Bluechip → Kotak Bluechip (or similar) | Overlap drops ~67% → ~41%, crash loss drops ~₹11,000 |

**Judge headline for V2.1:** "Three fund names. One ghost portfolio. ₹53,000 hidden contagion risk. And we can prove exactly which swap fixes it."

---

### Demo 2 — "The Typical Investor" (Moderate Overlap)

| Feature | Key Number | What it means |
|---|---|---|
| Ghost Portfolio — unique stocks | ~40–50 | Better spread than Demo 1 |
| Ghost Portfolio — in all 3 funds | ~5–8 | Fewer universal overlaps |
| Ghost Portfolio — HHI | 1000–2500 | "Moderate" concentration |
| Ghost Portfolio — excess fee vs index | ~₹2,000–3,500/yr | Still overpaying, but less |
| Crash Replay — COVID March 2020 | ~₹1,50,000–1,70,000 | Still painful — IT + banking hit hard |
| Crash Replay — IL&FS 2018 | ~₹55,000–70,000 | Less NBFC exposure helps |
| Contagion — IT 30% crash | Simple: ~₹38,000. With contagion: ~₹42,000–46,000 | IT has fewer correlated sectors |
| Rupee-at-Risk — VaR 95% | ~₹30,000–42,000 | Moderately lower than Demo 1 |
| Fund Swap Lab — best swap | Replace Axis Bluechip (overlaps 42% with Parag Parikh) | Overlap drops ~27% → ~18% |

**Judge headline for V2.1:** "IT risk is hiding across all three funds — and in March 2020, it would have cost ₹38,000."

---

### Demo 3 — "The Well-Diversified" (Low Overlap)

| Feature | Key Number | What it means |
|---|---|---|
| Ghost Portfolio — unique stocks | ~70–90 | Genuinely different holdings |
| Ghost Portfolio — in all 3 funds | ~2–4 | Almost no universal overlap |
| Ghost Portfolio — HHI | <1000 | "Diversified" |
| Ghost Portfolio — excess fee vs index | ~₹1,500–2,500/yr | Lower but still higher than one index fund |
| Crash Replay — COVID March 2020 | ~₹1,30,000–1,50,000 | Still hurts, but 20% less than Demo 1 |
| Crash Replay — 2008 GFC | ~₹2,40,000–2,60,000 | Everything falls in a GFC, but less concentrated = less damage |
| Contagion — Banking 30% crash | Simple: ~₹11,941. With contagion: ~₹15,000–18,000 | Low banking exposure = small cascade |
| Rupee-at-Risk — VaR 95% | ~₹25,000–35,000 | Noticeably lower than Demo 1 |
| Fund Swap Lab — best swap | Minimal improvement available | AI flags that two small-caps is not ideal, suggests adding debt/international |

**Judge headline for V2.1:** "Compare: Classic Mistake loses ₹58,000 with contagion. This portfolio loses ₹16,000. That is what real diversification buys you."

---

## 4. Feature Specifications — V2.1

### 4.5 Section 5 — Rupee-at-Risk

**What it answers:** "In a bad month, how much could I actually lose — in rupees?"

**Position in page:** First section after the "Deep Analysis" divider. Appears before Ghost Portfolio because the single number is immediately compelling.

**Headline (large, prominent):**
> "In a bad month, you could lose up to **₹47,000**"

**Sub-headline:**
> "That is X% of your ₹5,00,000 portfolio. This kind of drop happens roughly once every 2 years."

**Computation:** Parametric VaR using sector-level monthly volatilities and cross-sector correlations. All hardcoded data, computed client-side. No API call needed.

**Three risk tiers displayed as stat cards:**

| Tier | Confidence | Plain-English Label | Example (Demo 1) |
|---|---|---|---|
| Bad month | 95% VaR | "Happens once every ~2 years" | ₹47,000 |
| Really bad month | 99% VaR | "Happens once per decade" | ₹66,000 |
| Black swan | 99.9% VaR | "Happens once per 30 years" | ₹88,000 |

**Below the cards:** Portfolio volatility shown as a single line: "Portfolio volatility: 24.3% annualised | 7.0% monthly"

**Plain-English summary (2 paragraphs, template-based, no AI):**
- Paragraph 1: States the VaR95 number and what it means ("This is not a prediction — it is a measure of how much risk you are carrying right now.")
- Paragraph 2: Puts the worst case in context ("In a once-per-decade bad month, the loss could reach ₹66,000.")

**Design:**
- The VaR95 number appears in a large amber card (same style as ELI5 cards)
- Three tier cards in a horizontal row below
- No chart or graph — this section is about one number, not a visual

**Why no Indian tool has this:** VaR is an institutional metric. SEBI mandates it for mutual fund houses, but no retail-facing tool translates it into rupees for the individual investor. The closest is AMFI's stress test disclosure, which shows liquidation days, not loss amounts.

---

### 4.6 Section 6 — Ghost Portfolio

**What it answers:** "What do I actually own when all my funds are merged into one?"

**Position in page:** After Rupee-at-Risk. This is the "reveal" moment — the investor sees through the fund names to the real stocks underneath.

**Headline:**
> "Your Ghost Portfolio — what you actually own"

**Sub-headline:**
> "When all your funds are merged, this is your real stock portfolio."

**Four stat cards in a row:**

| Card | Demo 1 Value | Color |
|---|---|---|
| Unique stocks | 28 | Gray |
| In 2+ funds | 15 | Amber |
| In all funds | 12 | Red |
| Concentration (HHI) | 2,847 — Concentrated | Red border |

**HHI color bands:** green = <1000 (diversified), amber = 1000–2500 (moderate), red = >2500 (concentrated)

**Top 20 holdings table:**
| # | Stock | Sector | Weight | Rupees | Funds |
|---|---|---|---|---|---|
| 1 | HDFC Bank Ltd | Banking | 9.4% | ₹47,000 | 3 |
| 2 | Infosys Ltd | IT | 7.8% | ₹39,000 | 3 |
| ... | ... | ... | ... | ... | ... |

- "Funds" column shows a badge: gray (1), amber (2), red (3+)
- Table is scrollable on mobile, shows top 20 only
- Sorted by effective weight (highest first)

**Hidden fee card (amber banner, only shows if excess fee > 0):**
> "You are paying **₹4,200/year** in combined fund fees (effective TER: 0.55%). A single Nifty 50 index fund would cost just **₹500/year** — saving you **₹3,700 every year** for a very similar stock portfolio."

This card is the punchline. For Demo 1, the investor discovers their "diversified" portfolio is functionally an expensive index fund.

**Plain-English summary (3 lines, template-based):**
- Line 1: "Across all your funds, you actually own X unique stocks. But Y of them appear in 2+ funds."
- Line 2: "Your top 10 stocks make up Z% of your entire portfolio. Your concentration is [diversified/moderate/concentrated]."
- Line 3: Fee comparison (or "Your fee structure is efficient" if no excess)

**Why no Indian tool has this:** Every tool shows overlap between fund pairs. None merge all holdings into one consolidated view. The ghost portfolio is the equivalent of a "portfolio X-ray" — Morningstar offers this in the US for paid subscribers, but no free Indian tool does.

---

### 4.7 Section 7 — Historical Crash Replay

**What it answers:** "What would have happened to MY portfolio in real market crashes?"

**Position in page:** After Ghost Portfolio. This is emotional — real events, real dates, real losses.

**Headline:**
> "Historical Crash Replay"

**Sub-headline:**
> "What would have happened to your exact portfolio in real Indian market crashes."

**Five real events (hardcoded, with actual sector-level drawdowns from NSE data):**

| Event | Date | Nifty Drawdown | Duration | Story |
|---|---|---|---|---|
| COVID-19 Crash | March 2020 | −38% | 23 trading days | Fastest bear market in Indian history |
| IL&FS / NBFC Crisis | Sep–Oct 2018 | −16% | 6 weeks | NBFC liquidity crisis, contagion to banking |
| Demonetization Shock | Nov–Dec 2016 | −8.5% | 8 weeks | 86% of currency invalidated overnight |
| China-led Global Selloff | Aug–Sep 2015 | −12% | 5 weeks | Yuan devaluation, EM capital flight |
| 2008 Global Financial Crisis | Jan–Oct 2008 | −60% | 10 months | Lehman collapse, worst crash in Indian history |

**UI layout:**

1. **Event selector:** Horizontal pill buttons, one per event. Active pill is red, inactive is gray. Default: worst crash for this portfolio (sorted by total loss).

2. **Big loss number (center-aligned):**
   > **−₹2,10,000**
   > "Your portfolio would have lost 42% — dropping from ₹5,00,000 to ₹2,90,000"

3. **Sector-by-sector damage bars:**
   Each sector that contributed to the loss gets a horizontal bar showing:
   - Sector name
   - Red bar proportional to drawdown severity
   - Rupee loss: −₹39,000
   - Drawdown %: −43.2%
   
   Show top 8 sectors by loss. Sorted by rupee impact (not drawdown %).

4. **Event context (small text):** One-line description of what happened and why.

5. **Cross-event comparison cards (bottom):** Three cards showing the top 3 worst crashes side-by-side:
   | COVID-19 | IL&FS 2018 | GFC 2008 |
   |---|---|---|
   | −₹2,10,000 | −₹92,000 | −₹3,05,000 |
   | 42% of portfolio | 18.4% | 61% |

**Why this is powerful for judges:** Click "COVID-19" and the screen says "−₹2,10,000 in 23 days." That is not a hypothetical slider. That happened. The investor's exact portfolio, replayed against real sector-level data.

**Why no Indian tool has this:** SEBI mandated stress tests for fund houses (how quickly they can liquidate), but no retail tool replays historical events against a specific investor's portfolio with sector-level granularity. Platforms like Groww and Kuvera show historical NAV charts, but they do not compute "your portfolio-level loss in this specific event."

---

### 4.8 Section 8 — Contagion Map

**What it answers:** "When banking crashes, what else falls with it — and how much more do I lose?"

**Position in page:** After Crash Replay. Deepens the crash understanding by showing interconnection.

**Headline:**
> "Contagion Map"

**Sub-headline:**
> "When one sector crashes, correlated sectors fall too. This shows the real cascade."

**Interactive controls (same row):**
- Dropdown: "If [sector] drops..." (defaults to highest-exposure sector)
- Slider: crash severity 10%–60% (default 30%)
- Both update results live on every change

**Side-by-side comparison cards:**

| Left Card (neutral border) | Right Card (red border) |
|---|---|
| **Simple model** (one sector only) | **With contagion** (correlated sectors) |
| −₹39,934 | −₹53,200 |
| | "Simple model underestimates by ₹13,266 (33% more)" |

**Cascade visualization (below comparison):**
Vertical list of affected sectors, each row showing:
- Red dot (direct hit) or amber dot (contagion)
- Sector name
- Correlation coefficient in gray: (ρ=0.88)
- Horizontal bar showing crash severity
- Drawdown %
- Rupee loss

**Example for Demo 1, Banking 30% crash:**
| | Sector | ρ | Crash | Loss |
|---|---|---|---|---|
| 🔴 | Banking | 1.00 (direct) | −30.0% | −₹39,934 |
| 🟡 | NBFC | 0.88 | −26.4% | −₹5,200 |
| 🟡 | Financial Services | 0.92 | −27.6% | −₹4,800 |
| 🟡 | Insurance | 0.74 | −22.2% | −₹2,100 |
| 🟡 | Realty | 0.68 | −20.4% | −₹1,166 |

**Plain-English summary (1 paragraph):**
> "When Banking drops 30%, it does not stay contained. 4 other sectors in your portfolio are dragged down too, adding ₹13,266 in extra losses that a simple model would miss."

**Cross-sector correlation data:** 22 significant sector pairs with correlation > 0.5, derived from historical co-movement during stress events (COVID, IL&FS, GFC). This data is hardcoded — it does not change.

**Why no Indian tool has this:** Every crash simulator (including V2.0's) treats sectors as independent. In reality, Indian financial sector correlations are extremely high — Banking, NBFC, Insurance, and Financial Services move together with ρ > 0.70. A 30% banking crash in isolation looks manageable; with contagion, it is 33% worse. No retail tool models this.

---

### 4.9 Section 9 — Fund Swap Lab

**What it answers:** "If I replace one fund, how exactly does my portfolio improve — with proof?"

**Position in page:** Last section. This is the resolution — the actionable fix.

**Headline:**
> "Fund Swap Lab"

**Sub-headline:**
> "Pick a fund to replace and see exactly how it changes your portfolio risk."

**Three-step interactive flow:**

**Step 1 — "Which fund do you want to swap out?"**
- Three cards (one per fund in portfolio), showing fund short name, amount, category
- Click one to select it. Selected card turns red-tinted.
- This triggers candidate ranking (computed instantly client-side)

**Step 2 — "Pick a replacement"**
- Shows top 5 replacement candidates from the same SEBI category
- Each candidate card shows:
  - Fund name and category
  - Overlap change: "+12%" (red) or "−26%" (green)
  - Crash loss saved: "Saves ₹11,000 in worst crash" (green, only if positive)
- Click a candidate to select it. Selected card turns green-tinted.

**Step 3 — Before/After comparison**
Appears after a replacement is selected. Two cards side by side:

| Current Portfolio | After Swap |
|---|---|
| Avg overlap: **67.5%** | Avg overlap: **41.2%** (−26.3) |
| Top sector (Banking): **26.6%** | Top sector (Banking): **19.1%** (−7.5) |
| Worst 30% crash loss: **−₹39,934** | Worst 30% crash loss: **−₹28,700** (saves ₹11,234) |

The "After Swap" card has a green border and green background tint. All delta values are shown in parentheses.

**Candidate ranking algorithm:**
- Filter: same SEBI category as the fund being removed, not already in portfolio
- Score: overlap reduction (weighted 70%) + crash loss reduction (weighted 30%)
- Sort: highest score first
- Show: top 5

**Example for Demo 1, replacing Axis Bluechip:**

| Rank | Replacement | Overlap Change | Crash Loss Saved |
|---|---|---|---|
| 1 | Kotak Bluechip | −26.3% | ₹11,234 |
| 2 | ICICI Prudential Bluechip | −22.1% | ₹8,900 |
| 3 | UTI Nifty 50 Index | −31.5% | ₹7,200 |
| 4 | Canara Robeco Bluechip | −19.8% | ₹6,100 |
| 5 | Nippon India Large Cap | −15.2% | ₹4,800 |

> Note: Exact numbers depend on holdings data in `funds.json`. The ranking is computed live — not hardcoded.

**Why this is the killer feature for judges:** V2.0 says "you have a problem." V2.1 says "here's the exact fix, and here's the mathematical proof that it works." The before/after comparison is undeniable. No opinion, no jargon — just numbers changing.

**Why no Indian tool has this:** Robo-advisors (Kuvera, Groww) recommend funds, but they never show the mathematical impact of a swap on overlap, sector concentration, and crash risk simultaneously. Fee-only advisors do this manually in Excel. This tool does it instantly, interactively, for free.

---

## 5. Updated Backend API Specification

### `GET /api/funds` (updated)
- Returns: full `funds.json` array — now includes `ter` field (Total Expense Ratio as %) for each fund
- New field example: `"ter": 0.49` (Axis Bluechip direct plan)

### `POST /api/insights` (updated prompt)
Request body now includes two additional fields:
```json
{
  "portfolioSummary": "string",
  "overlapSummary": "string",
  "sectorSummary": "string",
  "availableFunds": ["list"],
  "ghostSummary": "string — unique stocks, redundant count, HHI, effective TER",
  "varSummary": "string — VaR95 rupee amount"
}
```
Response now includes two additional fields:
```json
{
  "concentrated": "string",
  "redundant": "string",
  "recommendation": "string",
  "ghostInsight": "string — what the merged portfolio reveals (e.g. paying high fees for index-like returns)",
  "riskInsight": "string — putting the VaR number in everyday context"
}
```

---

## 6. New Data Requirements

### 6.1 Fund TER (added to funds.json)
Each of the 20 funds needs a `ter` field — the direct plan Total Expense Ratio from AMFI's latest monthly factsheet.

### 6.2 Historical Crash Data (new file: historicalCrashes.js)
Five events with sector-level drawdowns from NSE sector index data. Hardcoded. Does not change.

### 6.3 Sector Correlations (new file: sectorCorrelations.js)
22 sector pairs with correlation coefficients > 0.5, derived from 5-year historical co-movement during stress events. Hardcoded.

### 6.4 Sector Volatility (new file: sectorVolatility.js)
Annualized monthly return standard deviation for 19 sectors, from 5 years of NSE sector index data. Hardcoded.

**All data is static.** No new API endpoints, no real-time fetching, no external data dependencies at runtime.

---

## 7. Design Principles (extended from V2.0)

All V2.0 principles apply. Additional principles for V2.1:

- **"Deep Analysis" is a visually separate section** — a `border-t` divider with a heading separates V2.0 results from V2.1 deep dives. This prevents information overload and creates a natural scroll checkpoint.
- **One dramatic number per section** — Rupee-at-Risk has the VaR95 number. Ghost Portfolio has the HHI. Crash Replay has the total loss. Contagion has the "simple vs real" gap. Fund Swap Lab has the overlap delta. Each section leads with its number.
- **Before/after is always shown** — Fund Swap Lab is not advisory ("maybe consider..."). It is mathematical proof ("overlap drops from 67% to 41%"). Show both numbers, always.
- **Amber for moderate, red for severe** — consistent with V2.0 color bands. Green only appears in improvement contexts (Fund Swap Lab "after" card).
- **Interactive controls are inline** — Contagion Map's sector picker and slider are in the same row as the heading. No modals, no separate pages, no tabs.

---

## 8. Updated Demo Script (150 seconds total)

### Part 1 — Original (90 seconds, unchanged)
1. Open the page — "Most investors think they're diversified. Here's what's actually happening."
2. Click **"The Classic Mistake"** — results appear
3. Overlap matrix red cells — "Three fund names. 67% identical stocks."
4. Crash slider to 40% — "Banking dropped 30% in 2020. ₹53,000 lost."
5. ELI5 sentence — "We explain it the way your parents would understand."
6. AI card — "Gemini tells them which fund to swap."

### Part 2 — Deep Analysis (60 seconds)
7. Scroll to **Rupee-at-Risk** — say: "Institutions call this Value at Risk. We call it 'how much you could lose in a bad month.' For this portfolio: ₹47,000. In rupees, not percentages."
8. Scroll to **Ghost Portfolio** — say: "Three fund names. But look at their ghost portfolio — they actually hold the same 15 stocks. And they are paying ₹4,200 more per year than a single index fund for essentially the same thing."
9. Scroll to **Crash Replay**, click **COVID-19** — say: "This is not hypothetical. In March 2020, this portfolio would have lost ₹2,10,000 in 23 days. We replayed the actual crash against their actual holdings."
10. Scroll to **Contagion Map** — say: "And here is what no other tool in India shows. When banking crashes, it does not stay in banking." [Point to cascade] "NBFC drops 26%. Insurance drops 22%. That adds ₹13,000 in losses that the simple model completely misses."
11. Scroll to **Fund Swap Lab**, click Axis Bluechip, pick top replacement — say: "And this is the fix. Swap one fund. Overlap drops from 67% to 41%. Crash loss shrinks by ₹11,000. Not advice — mathematical proof."

**Then hand the laptop to a judge and say: "Try your own portfolio. Everything computes in real time."**

---

## 9. Competitive Landscape

| Feature | Dezerv | PrimeInvestor | freefincal | BusinessToday | AdvisorKhoj | **MF Analyzer V2.1** |
|---|---|---|---|---|---|---|
| Pairwise overlap | ✓ (2 funds) | ✓ (2–3 funds) | ✓ (3 funds) | ✓ (2 funds) | ✓ (2 funds) | ✓ (up to 6 funds) |
| Multi-fund overlap matrix | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Rupee amounts (not just %) | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Crash simulator | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Ghost portfolio (merged view) | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| HHI concentration index | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Fee comparison vs index | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Historical crash replay | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Cross-sector contagion | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Fund swap simulator | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| Rupee-at-Risk (VaR) | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| AI-powered insights | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |
| ELI5 plain English | ✗ | ✗ | ✗ | ✗ | ✗ | **✓** |

**Summary:** Every competitor does one thing (pairwise overlap with a Venn diagram). MF Analyzer V2.1 does thirteen things. The gap is not incremental — it is categorical.

---

## 10. Non-Goals (same as V2.0, plus)

- User accounts or login
- CAS PDF upload
- SIP projections or tax harvesting
- Real-time NAV fetching
- Mobile app or PWA
- **Real-time holdings data** — all data is from a static snapshot. Good enough for a hackathon; production version would pull from AMFI monthly disclosures
- **Tax-loss harvesting recommendations** — Fund Swap Lab shows risk improvement, not tax implications
- **Correlation updates** — sector correlations are hardcoded from historical data. A production version would recompute quarterly
- **Portfolio optimization** — we show what is wrong and what to swap. We do not auto-generate the "optimal" portfolio (that is advisory, and we are not SEBI-registered)

---

## 11. Success Metrics (for hackathon judging)

| Metric | Target |
|---|---|
| Demo 1 → Demo 3 loss comparison visible in <5 seconds | All three demos load and display V2.1 results instantly |
| Judge can use Fund Swap Lab without instruction | 3-step flow is self-explanatory |
| COVID crash replay produces "wow" reaction | Big red loss number, real date, real event |
| Contagion "simple vs real" gap is > 20% for banking | ₹39,934 vs ₹53,200 — undeniable difference |
| Ghost Portfolio fee card is memorable | "Paying ₹4,200 more for the same stocks" sticks |
| Everything works on judge's phone | 375px minimum, all interactive controls work on touch |
| Gemini failure does not break V2.1 features | All 5 new features are client-side, AI-independent |
