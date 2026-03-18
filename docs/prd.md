# Product Requirements Document
## MF Portfolio Analyzer — Overlap, Risk & AI Insights

**Version:** 2.0  
**Date:** March 18, 2026  
**Status:** Hackathon MVP  

---

## 1. Product Overview

### 1.1 One-line pitch
A free web tool that tells Indian mutual fund investors — in plain language — whether their portfolio is secretly concentrated, what a sector crash would actually cost in rupees, and exactly what to change.

### 1.2 Problem statement
Most Indian retail investors hold 3–6 mutual funds believing they are diversified. In reality, three popular large-cap funds (Axis Bluechip, Mirae Asset Large Cap, SBI Bluechip) overlap by **67.5% on average** — meaning two-thirds of their money goes to identical companies. No mainstream app shows this clearly. The investor has no idea that if banking drops 30%, they lose ₹40,000 from a ₹5 lakh portfolio — not a percentage, actual rupees.

### 1.3 Target user
- Indian retail investor, 25–45 years old
- Holds 2–6 mutual funds via smallcase, Groww, Zerodha, or Kuvera
- Has never done a portfolio review
- Comfortable using a smartphone or laptop browser

### 1.4 Architecture overview
- **Frontend:** React + Vite — all overlap and sector calculations run client-side
- **Backend:** Node.js + Express — serves `funds.json`, proxies Gemini API (key never exposed to browser)
- **AI:** Google Gemini 1.5 Flash via backend proxy
- **Deploy:** Frontend on Vercel, Backend on Railway (both free tier)

---

## 2. User Flow

```
Landing page
    │
    ├── Three demo buttons (prominent, at the top)
    │       ├── "The Classic Mistake"  → 67% avg overlap
    │       ├── "Typical Investor"     → 27% avg overlap
    │       └── "Well-Diversified"     → 13% avg overlap
    │
    └── Manual input (below demo buttons)
            └── Fund dropdown + amount → Analyse button
    │
    ▼
Results (auto-scroll on demo click, manual click on Analyse)
    ├── Section 1: Overlap Matrix
    ├── Section 2: Sector Chart + Crash Simulator
    ├── Section 3: ELI5 Summary
    └── Section 4: AI Insights (Gemini via backend)
```

---

## 3. Three Curated Demo Portfolios

These are hardcoded and deterministic. Overlap numbers are computed from real holdings data and never change. Each tells a different story to judges.

---

### Demo 1 — "The Classic Mistake" (High Overlap)

**Story for judges:** "You picked three different fund names. You're holding almost the same stocks."

| Fund | Amount | Category | Scheme Code |
|---|---|---|---|
| Axis Bluechip Fund — Direct Growth | ₹2,00,000 | Large Cap | 120503 |
| Mirae Asset Large Cap Fund — Direct Growth | ₹1,50,000 | Large Cap | 118989 |
| SBI Bluechip Fund — Direct Growth | ₹1,50,000 | Large Cap | 119822 |

**Real computed numbers:**

| Pair | Overlap |
|---|---|
| Axis Bluechip ↔ Mirae Asset Large Cap | **69.6%** |
| Axis Bluechip ↔ SBI Bluechip | **65.6%** |
| Mirae Asset Large Cap ↔ SBI Bluechip | **67.2%** |
| **Average** | **67.5%** |

Top shared stock: HDFC Bank Ltd — held at 9–10% in all three funds.

| Sector | Exposure | 30% crash loss |
|---|---|---|
| Banking | 26.6% → ₹1,33,000 | **₹39,934** |
| IT | 24.9% → ₹1,24,500 | **₹37,318** |

**Judge headline:** "Three fund names. One portfolio."

---

### Demo 2 — "The Typical Investor" (Moderate — Default demo)

**Story for judges:** "A common portfolio mix — looks diversified, but IT concentration is hiding in plain sight."

| Fund | Amount | Category | Scheme Code |
|---|---|---|---|
| Parag Parikh Flexi Cap Fund — Direct Growth | ₹2,00,000 | Flexi Cap | 122639 |
| HDFC Mid-Cap Opportunities Fund — Direct Growth | ₹1,50,000 | Mid Cap | 119533 |
| Axis Bluechip Fund — Direct Growth | ₹1,50,000 | Large Cap | 120503 |

**Real computed numbers:**

| Pair | Overlap |
|---|---|
| Parag Parikh ↔ HDFC Mid-Cap | **16.9%** |
| Parag Parikh ↔ Axis Bluechip | **42.3%** |
| HDFC Mid-Cap ↔ Axis Bluechip | **23.2%** |
| **Average** | **27.5%** |

| Sector | Exposure | 30% crash loss |
|---|---|---|
| IT | 25.4% → ₹1,27,000 | **₹38,092** |
| Banking | 17.1% → ₹85,500 | **₹25,721** |

**Judge headline:** "Moderate overlap, but IT risk is hiding across all three funds."

---

### Demo 3 — "The Well-Diversified" (Low Overlap)

**Story for judges:** "This is what genuine diversification actually looks like — and why it matters."

| Fund | Amount | Category | Scheme Code |
|---|---|---|---|
| Parag Parikh Flexi Cap Fund — Direct Growth | ₹2,00,000 | Flexi Cap | 122639 |
| Nippon India Small Cap Fund — Direct Growth | ₹1,50,000 | Small Cap | 118701 |
| SBI Small Cap Fund — Direct Growth | ₹1,50,000 | Small Cap | 125497 |

**Real computed numbers:**

| Pair | Overlap |
|---|---|
| Parag Parikh ↔ Nippon Small Cap | **7.2%** |
| Parag Parikh ↔ SBI Small Cap | **11.6%** |
| Nippon Small Cap ↔ SBI Small Cap | **21.2%** |
| **Average** | **13.3%** |

| Sector | Exposure | 30% crash loss |
|---|---|---|
| IT | 16.8% → ₹84,000 | **₹25,214** |
| Banking | 8.0% → ₹40,000 | **₹11,941** |

**Judge headline:** "Compare: the Classic Mistake loses ₹39,934 if banking crashes. This portfolio loses ₹11,941."

> Note: Two small-cap funds is not an ideal real-world portfolio. This demo is constructed for low-overlap demonstration. The AI insight section will explicitly flag this and suggest diversification improvements.

---

## 4. Feature Specifications

### 4.1 Portfolio Input

**Demo buttons — shown prominently at the top, before manual input**

Three buttons, side by side, each with a badge showing average overlap:

```
[ The Classic Mistake        ] [ Typical Investor           ] [ Well-Diversified           ]
[ avg 67% overlap — high risk ] [ avg 27% overlap           ] [ avg 13% overlap — low risk ]
```

Clicking any demo button:
1. Populates the fund list display with the pre-set portfolio
2. Immediately triggers the full analysis pipeline
3. Scrolls smoothly to the results section

**Manual input — shown below demo section**
- Searchable dropdown populated via `GET /api/funds`
- User types partial fund name → filtered list from API response
- Each result shows: fund name, AMC, category badge
- User selects a fund → enters amount in ₹ (minimum ₹1,000)
- Add up to 6 funds; remove any with X button
- "Analyse" button disabled until 2+ valid entries

---

### 4.2 Section 1 — Overlap Matrix

**Headline (large, prominent):**
> "Your funds share **X%** of the same stocks on average"

Color bands: green = 0–20%, amber = 21–40%, red = 41%+

**Matrix grid:** One cell per fund pair showing the overlap percentage. Cells are color-coded.

**Shared stocks list:** Top 10 stocks that appear in 2+ funds, sorted by combined weight. Shows: stock name, sector, which funds hold it, combined weight.

---

### 4.3 Section 2 — Sector Crash Simulator

**Horizontal bar chart** showing portfolio sector exposure as %.

**Interactive simulator below the chart:**
- Dropdown: select any sector (defaults to highest-exposure sector)
- Slider: crash severity 10–60% (default 30%)
- Live update on every slider movement:
  > **"If Banking drops 30%, your portfolio loses 10%"**

---

### 4.4 Section 3 — ELI5 Summary

Three paragraphs, computed from results using hardcoded templates. No AI. No jargon. Grade 8 reading level.

- Paragraph 1: "You are not as diversified as you think" (or "Your diversification looks solid")
- Paragraph 2: "Your biggest hidden risk" — names the top sector and its rupee impact
- Paragraph 3: "What's actually working" — identifies the most unique fund and why

---

### 4.5 Section 4 — AI Insights (Gemini via backend)

Calls `POST /api/insights`. Shows spinner while loading ("Asking our AI analyst...").

Renders three cards:
1. **What's concentrated** — amber left border
2. **What's redundant** — red left border
3. **What to change** — green left border (includes specific fund suggestion)

**On failure:** Show a non-blocking message. Results sections 1–3 must still display normally.

---

## 5. Backend API Specification

### `GET /api/funds`
- No auth required
- Returns: full `funds.json` array (20 funds, all fields)
- Used by: frontend dropdown on load

### `POST /api/insights`
Request body:
```json
{
  "portfolioSummary": "string — fund names, amounts, top sectors",
  "overlapSummary": "string — pairwise overlap data",
  "sectorSummary": "string — sector weights and crash scenario",
  "availableFunds": ["list of fund names not in portfolio, same categories"]
}
```
Response:
```json
{
  "concentrated": "string",
  "redundant": "string",
  "recommendation": "string"
}
```
The backend holds `GEMINI_API_KEY` as an env variable. It never appears in any frontend code or browser request.

---

## 6. Design Principles

- Clean, white, minimal — Tailwind CSS utility classes only
- Mobile-first at 375px minimum width
- Single scroll page, no routing
- Rupees always shown alongside percentages
- No jargon without immediate plain-English explanation
- Every async operation has a visible loading state

---

## 7. Demo Script (90 seconds)

1. Open the page — say: "Most investors think they're diversified. Here's what's actually happening."
2. Click **"The Classic Mistake"** — results appear automatically
3. Point to the overlap matrix red cells: "Three different fund names. 67% identical stocks. That's not diversification."
4. Drag the crash slider to 40% — say: "Banking dropped over 30% in 2020. This person would have lost ₹53,000. Real rupees."
5. Read one ELI5 sentence — say: "We explain it the way your parents would understand."
6. AI card appears — say: "Gemini tells them exactly which fund to swap and why."

**Then hand the laptop to a judge and say: "Try your own portfolio."**

---

## 8. Non-Goals

- User accounts or login
- CAS PDF upload
- SIP projections or tax harvesting
- Real-time NAV fetching
- Mobile app or PWA
