# Technical Requirements Document
## MF Portfolio Analyzer — Overlap, Risk & AI Insights

**Version:** 2.0  
**Date:** March 18, 2026  
**Stack:** React + Vite · Node.js + Express · Chart.js · Gemini API  
**Deploy:** Frontend → Vercel · Backend → Railway  
**Target build time:** 9 hours  

---

## 1. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend framework | React 18 + Vite | Fast setup, HMR, zero config |
| Styling | Tailwind CSS (CDN) | No PostCSS build step needed |
| Charts | Chart.js 4 | Simple horizontal bar chart, CDN |
| Backend | Node.js + Express | Lightweight, fast to set up |
| AI proxy | Express route → Gemini | Key stays server-side |
| Data | Static `funds.json` on backend | Served via API, not bundled into frontend |
| Frontend deploy | Vercel | Free, HTTPS, auto-deploy from Git |
| Backend deploy | Railway | Free tier, HTTPS, environment vars |

---

## 2. Project Structure

```
mf-analyzer/
├── backend/
│   ├── server.js              # Express server — /api/funds + /api/insights
│   ├── data/
│   │   └── funds.json         # 20 funds with holdings and sector weights
│   ├── package.json
│   └── .env                   # GEMINI_API_KEY, PORT
│
├── frontend/
│   ├── src/
│   │   ├── data/
│   │   │   └── demoPortfolios.js      # 3 hardcoded demo sets (scheme codes + amounts)
│   │   ├── lib/
│   │   │   ├── overlap.js             # Overlap engine
│   │   │   ├── sectorRisk.js          # Sector exposure + crash calculator
│   │   │   └── eli5.js               # ELI5 text generator (template-based)
│   │   ├── components/
│   │   │   ├── DemoButtons.jsx        # Three demo portfolio buttons
│   │   │   ├── PortfolioInput.jsx     # Manual fund search + amount inputs
│   │   │   ├── OverlapMatrix.jsx      # Matrix grid + shared stocks table
│   │   │   ├── SectorChart.jsx        # Chart.js horizontal bar
│   │   │   ├── CrashSimulator.jsx     # Sector dropdown + severity slider
│   │   │   ├── ELI5Section.jsx        # Plain-English summary cards
│   │   │   └── AIInsights.jsx         # Gemini response cards
│   │   ├── App.jsx                    # State orchestration + layout
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js                 # Proxy /api/* to backend in dev
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 3. Backend — server.js

```javascript
import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// Load funds.json once at startup
const funds = JSON.parse(
  readFileSync(join(__dirname, 'data/funds.json'), 'utf8')
);

// ── GET /api/funds ────────────────────────────────────────────────────────────
app.get('/api/funds', (req, res) => {
  res.json(funds);
});

// ── POST /api/insights ────────────────────────────────────────────────────────
app.post('/api/insights', async (req, res) => {
  const { portfolioSummary, overlapSummary, sectorSummary, availableFunds } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured' });
  }

  const prompt = `You are a friendly Indian mutual fund analyst explaining portfolio analysis to a beginner investor. Be direct, specific, use rupee amounts. No jargon. Max 2 sentences per field.

Portfolio:
${portfolioSummary}

Fund overlap:
${overlapSummary}

Sector exposure:
${sectorSummary}

Replacement funds available (same category, not in portfolio): ${availableFunds}

Respond ONLY with valid JSON, no markdown fences:
{
  "concentrated": "Which sector or stock is too concentrated and why it matters in simple terms.",
  "redundant": "Which fund pair overlaps most and what the investor should know.",
  "recommendation": "One specific action — name a fund to reduce and a replacement to consider, with a one-line reason."
}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      throw new Error(`Gemini responded ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(502).json({ error: 'AI service unavailable' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
```

**backend/package.json:**
```json
{
  "name": "mf-analyzer-backend",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "node-fetch": "^3.3.2"
  }
}
```

**backend/.env:**
```
GEMINI_API_KEY=your_key_here
PORT=3001
```

---

## 4. Vite Dev Proxy (frontend/vite.config.js)

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

This routes all `/api/*` calls in development to the local Express server. In production on Vercel, set `VITE_API_BASE_URL` to the Railway backend URL.

---

## 5. Demo Portfolios — demoPortfolios.js

```javascript
// src/data/demoPortfolios.js
// Overlap numbers are pre-computed and hardcoded — they never change.
// These are displayed in the UI to set expectations before the demo fires.

export const DEMO_PORTFOLIOS = {
  high: {
    label: 'The Classic Mistake',
    badge: 'avg 67% overlap',
    description: 'Three large-cap funds that sound different but hold nearly identical stocks.',
    avgOverlap: 67.5,
    riskLevel: 'high',
    entries: [
      { schemeCode: '120503', amount: 200000 }, // Axis Bluechip Fund
      { schemeCode: '118989', amount: 150000 }, // Mirae Asset Large Cap Fund
      { schemeCode: '119822', amount: 150000 }, // SBI Bluechip Fund
    ],
    // Pre-computed for instant display before API call resolves
    precomputed: {
      pairs: [
        { fundA: 'Axis Bluechip', fundB: 'Mirae Asset Large Cap', overlapPct: 69.6 },
        { fundA: 'Axis Bluechip', fundB: 'SBI Bluechip', overlapPct: 65.6 },
        { fundA: 'Mirae Asset Large Cap', fundB: 'SBI Bluechip', overlapPct: 67.2 },
      ],
      topSharedStock: 'HDFC Bank Ltd — held at 9–10% in all three funds',
      bankingCrash30pct: 39934,
    },
  },

  typical: {
    label: 'Typical Investor',
    badge: 'avg 27% overlap',
    description: 'A common mix across categories — but IT concentration is hidden across all three.',
    avgOverlap: 27.5,
    riskLevel: 'medium',
    entries: [
      { schemeCode: '122639', amount: 200000 }, // Parag Parikh Flexi Cap
      { schemeCode: '119533', amount: 150000 }, // HDFC Mid-Cap Opportunities
      { schemeCode: '120503', amount: 150000 }, // Axis Bluechip
    ],
    precomputed: {
      pairs: [
        { fundA: 'Parag Parikh Flexi Cap', fundB: 'HDFC Mid-Cap', overlapPct: 16.9 },
        { fundA: 'Parag Parikh Flexi Cap', fundB: 'Axis Bluechip', overlapPct: 42.3 },
        { fundA: 'HDFC Mid-Cap', fundB: 'Axis Bluechip', overlapPct: 23.2 },
      ],
      topSharedStock: 'IT sector at 25.4% — hidden concentration across all three funds',
      itCrash30pct: 38092,
    },
  },

  low: {
    label: 'Well-Diversified',
    badge: 'avg 13% overlap',
    description: 'Genuinely different funds across categories — much lower single-sector risk.',
    avgOverlap: 13.3,
    riskLevel: 'low',
    entries: [
      { schemeCode: '122639', amount: 200000 }, // Parag Parikh Flexi Cap
      { schemeCode: '118701', amount: 150000 }, // Nippon India Small Cap
      { schemeCode: '125497', amount: 150000 }, // SBI Small Cap
    ],
    precomputed: {
      pairs: [
        { fundA: 'Parag Parikh Flexi Cap', fundB: 'Nippon Small Cap', overlapPct: 7.2 },
        { fundA: 'Parag Parikh Flexi Cap', fundB: 'SBI Small Cap', overlapPct: 11.6 },
        { fundA: 'Nippon Small Cap', fundB: 'SBI Small Cap', overlapPct: 21.2 },
      ],
      topSharedStock: 'No single stock dominates — most holdings are unique per fund',
      bankingCrash30pct: 11941,
    },
  },
};
```

---

## 6. Core Logic

### 6.1 overlap.js

```javascript
// src/lib/overlap.js

export function computeOverlap(fundA, fundB) {
  const holdingsB = new Map(fundB.holdings.map(h => [h.isin, h.weight]));
  let overlapPct = 0;
  const shared = [];

  for (const h of fundA.holdings) {
    if (holdingsB.has(h.isin)) {
      const wB = holdingsB.get(h.isin);
      overlapPct += Math.min(h.weight, wB);
      shared.push({ isin: h.isin, name: h.name, sector: h.sector, weightA: h.weight, weightB: wB });
    }
  }

  shared.sort((a, b) => (b.weightA + b.weightB) - (a.weightA + a.weightB));
  return { overlapPct: +overlapPct.toFixed(1), shared };
}

export function analyseOverlap(portfolio) {
  const pairs = [];

  for (let i = 0; i < portfolio.length; i++) {
    for (let j = i + 1; j < portfolio.length; j++) {
      const { overlapPct, shared } = computeOverlap(portfolio[i].fund, portfolio[j].fund);
      pairs.push({
        fundA: portfolio[i].fund.name,
        fundB: portfolio[j].fund.name,
        codeA: portfolio[i].fund.schemeCode,
        codeB: portfolio[j].fund.schemeCode,
        overlapPct,
        sharedStocks: shared,
      });
    }
  }

  // Aggregate top shared stocks across all pairs
  const stockMap = new Map();
  for (const pair of pairs) {
    for (const s of pair.sharedStocks) {
      if (!stockMap.has(s.isin)) {
        stockMap.set(s.isin, { ...s, appearsIn: 2, combinedWeight: s.weightA + s.weightB });
      } else {
        const ex = stockMap.get(s.isin);
        ex.appearsIn += 1;
        ex.combinedWeight += s.weightB;
      }
    }
  }

  const topSharedStocks = [...stockMap.values()]
    .sort((a, b) => b.combinedWeight - a.combinedWeight)
    .slice(0, 10);

  const averageOverlapPct = pairs.length
    ? +(pairs.reduce((s, p) => s + p.overlapPct, 0) / pairs.length).toFixed(1)
    : 0;

  return { pairs, topSharedStocks, averageOverlapPct };
}
```

### 6.2 sectorRisk.js

```javascript
// src/lib/sectorRisk.js

export function computeSectorExposure(portfolio) {
  const totalInvested = portfolio.reduce((s, p) => s + p.amount, 0);
  const sectorMap = {};

  for (const { fund, amount } of portfolio) {
    const fundWeight = amount / totalInvested;
    for (const [sector, pct] of Object.entries(fund.sectorWeights)) {
      sectorMap[sector] = (sectorMap[sector] ?? 0) + pct * fundWeight;
    }
  }

  const exposure = {};
  for (const [sector, weightPct] of Object.entries(sectorMap)) {
    exposure[sector] = {
      weightPct: +weightPct.toFixed(1),
      rupeeAmount: Math.round(totalInvested * weightPct / 100),
    };
  }

  // Return sorted by weightPct descending
  return Object.fromEntries(
    Object.entries(exposure).sort((a, b) => b[1].weightPct - a[1].weightPct)
  );
}

export function simulateCrash(totalInvested, sectorExposure, sector, crashPct) {
  const exp = sectorExposure[sector];
  if (!exp) return { rupeeLoss: 0, portfolioPctLoss: 0 };
  const rupeeLoss = Math.round(exp.rupeeAmount * crashPct / 100);
  const portfolioPctLoss = +((rupeeLoss / totalInvested) * 100).toFixed(1);
  return { rupeeLoss, portfolioPctLoss };
}
```

### 6.3 eli5.js

```javascript
// src/lib/eli5.js

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

export function generateELI5(portfolio, overlapResult, sectorExposure) {
  const totalInvested = portfolio.reduce((s, p) => s + p.amount, 0);
  const avg = overlapResult.averageOverlapPct;

  const topSectors = Object.entries(sectorExposure);
  const [topSector, topData] = topSectors[0];
  const crashLoss = Math.round(topData.rupeeAmount * 0.30);

  // Find least-overlapping fund (most unique)
  const scores = {};
  for (const pair of overlapResult.pairs) {
    scores[pair.fundA] = (scores[pair.fundA] ?? 0) + pair.overlapPct;
    scores[pair.fundB] = (scores[pair.fundB] ?? 0) + pair.overlapPct;
  }
  const mostUnique = Object.entries(scores).sort((a, b) => a[1] - b[1])[0]?.[0] ?? '';
  const shortName = mostUnique.split(' - ')[0].split(' Fund')[0];

  return {
    diversification: avg > 40
      ? `Imagine buying three different fruit baskets, but all three are full of mangoes. ` +
        `Your funds work exactly like that — about ${avg}% of your money is going to the same companies, ` +
        `even though the fund names look different.`
      : avg > 20
        ? `Your funds have moderate overlap — about ${avg}% of your money goes to the same companies across funds. ` +
          `This is not terrible, but there is room to spread your risk further.`
        : `Good news — your funds are genuinely different from each other, with only ${avg}% overlap on average. ` +
          `That means most of your money is in different companies, which is what real diversification looks like.`,

    biggestRisk: `About ${topData.weightPct}% of your total portfolio — that is ${fmt(topData.rupeeAmount)} — ` +
      `is sitting in ${topSector} companies. ` +
      `If ${topSector} has a bad year, like many sectors did during COVID in 2020, ` +
      `you could lose around ${fmt(crashLoss)} just from that one sector dropping 30%.`,

    goodNews: shortName
      ? `"${shortName}" is your most unique holding — it has the least overlap with your other funds. ` +
        `That is the one doing the most work to protect you when other things fall together. ` +
        `The AI section below will tell you specifically what to do next.`
      : `Consider adding a fund from a completely different category — like an international or debt fund — ` +
        `to genuinely reduce your exposure when Indian markets fall.`,
  };
}
```

---

## 7. App.jsx — State Orchestration

```jsx
// src/App.jsx
import { useState, useEffect } from 'react';
import { DEMO_PORTFOLIOS } from './data/demoPortfolios';
import { analyseOverlap } from './lib/overlap';
import { computeSectorExposure } from './lib/sectorRisk';
import { generateELI5 } from './lib/eli5';
import DemoButtons from './components/DemoButtons';
import PortfolioInput from './components/PortfolioInput';
import OverlapMatrix from './components/OverlapMatrix';
import SectorChart from './components/SectorChart';
import CrashSimulator from './components/CrashSimulator';
import ELI5Section from './components/ELI5Section';
import AIInsights from './components/AIInsights';

export default function App() {
  const [allFunds, setAllFunds] = useState([]);
  const [portfolio, setPortfolio] = useState([]);   // [{ fund, amount }]
  const [results, setResults] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiInsights, setGeminiInsights] = useState(null);

  // Fetch funds from backend on mount
  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL ?? '';
    fetch(`${base}/api/funds`)
      .then(r => r.json())
      .then(setAllFunds)
      .catch(err => console.error('Failed to load funds:', err));
  }, []);

  async function runAnalysis(port) {
    setIsAnalysing(true);
    setResults(null);
    setGeminiInsights(null);

    const overlap = analyseOverlap(port);
    const sectorExposure = computeSectorExposure(port);
    const eli5 = generateELI5(port, overlap, sectorExposure);
    const totalInvested = port.reduce((s, p) => s + p.amount, 0);

    setResults({ totalInvested, portfolio: port, overlap, sectorExposure, eli5 });
    setIsAnalysing(false);

    // Scroll to results
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);

    // Async Gemini call
    setGeminiLoading(true);
    const insights = await fetchGeminiInsights(port, overlap, sectorExposure);
    setGeminiInsights(insights);
    setGeminiLoading(false);
  }

  function handleDemo(key) {
    const demo = DEMO_PORTFOLIOS[key];
    const port = demo.entries.map(e => ({
      fund: allFunds.find(f => f.schemeCode === e.schemeCode),
      amount: e.amount,
    })).filter(e => e.fund);
    setPortfolio(port);
    runAnalysis(port);
  }

  async function fetchGeminiInsights(port, overlap, sectorExposure) {
    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? '';
      const totalInvested = port.reduce((s, p) => s + p.amount, 0);
      const portfolioCodes = new Set(port.map(p => p.fund.schemeCode));
      const cats = [...new Set(port.map(p => p.fund.category))];
      const available = allFunds
        .filter(f => !portfolioCodes.has(f.schemeCode) && cats.includes(f.category))
        .map(f => f.name.split(' - ')[0])
        .slice(0, 5)
        .join(', ');

      const portfolioSummary = port.map(({ fund, amount }) => {
        const top2 = Object.entries(fund.sectorWeights).slice(0, 2)
          .map(([s, w]) => `${s} ${w.toFixed(0)}%`).join(', ');
        return `- ${fund.name.split(' - ')[0]}: ₹${amount.toLocaleString('en-IN')} (${top2})`;
      }).join('\n');

      const overlapSummary = overlap.pairs.map(p =>
        `- ${p.fundA.split(' - ')[0]} ↔ ${p.fundB.split(' - ')[0]}: ${p.overlapPct}%`
      ).join('\n');

      const sectorSummary = Object.entries(sectorExposure).slice(0, 5)
        .map(([s, d]) => `- ${s}: ${d.weightPct}% (₹${d.rupeeAmount.toLocaleString('en-IN')})`)
        .join('\n');

      const res = await fetch(`${base}/api/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioSummary, overlapSummary, sectorSummary, availableFunds: available }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Gemini insights failed:', err);
      return null;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-medium text-gray-900 mb-2">MF Portfolio Analyzer</h1>
      <p className="text-gray-500 mb-8">Find out if your mutual funds are secretly holding the same stocks.</p>

      <DemoButtons onDemo={handleDemo} disabled={allFunds.length === 0} />

      <div className="my-8 border-t border-gray-100" />

      <PortfolioInput
        allFunds={allFunds}
        portfolio={portfolio}
        onPortfolioChange={setPortfolio}
        onAnalyse={() => runAnalysis(portfolio)}
        isAnalysing={isAnalysing}
      />

      {results && (
        <div id="results" className="mt-12 space-y-12">
          <OverlapMatrix overlap={results.overlap} />
          <SectorChart sectorExposure={results.sectorExposure} />
          <CrashSimulator
            totalInvested={results.totalInvested}
            sectorExposure={results.sectorExposure}
          />
          <ELI5Section eli5={results.eli5} />
          <AIInsights insights={geminiInsights} loading={geminiLoading} />
        </div>
      )}
    </div>
  );
}
```

---

## 8. DemoButtons.jsx

```jsx
// src/components/DemoButtons.jsx
import { DEMO_PORTFOLIOS } from '../data/demoPortfolios';

const riskColors = {
  high:   'border-red-200 bg-red-50 hover:bg-red-100',
  medium: 'border-amber-200 bg-amber-50 hover:bg-amber-100',
  low:    'border-green-200 bg-green-50 hover:bg-green-100',
};

const badgeColors = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-green-100 text-green-700',
};

export default function DemoButtons({ onDemo, disabled }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500 mb-3">Try a demo portfolio:</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(DEMO_PORTFOLIOS).map(([key, demo]) => (
          <button
            key={key}
            onClick={() => onDemo(key)}
            disabled={disabled}
            className={`text-left p-4 rounded-xl border transition-colors disabled:opacity-40 ${riskColors[demo.riskLevel]}`}
          >
            <div className="font-medium text-gray-900 text-sm mb-1">{demo.label}</div>
            <div className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${badgeColors[demo.riskLevel]}`}>
              {demo.badge}
            </div>
            <div className="text-xs text-gray-500 leading-snug">{demo.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 9. AIInsights.jsx

```jsx
// src/components/AIInsights.jsx
const CARD_STYLES = {
  concentrated: { border: 'border-l-amber-400', bg: 'bg-amber-50', title: 'What is concentrated' },
  redundant:    { border: 'border-l-red-400',   bg: 'bg-red-50',   title: 'What is redundant' },
  recommendation: { border: 'border-l-green-400', bg: 'bg-green-50', title: 'What to change' },
};

export default function AIInsights({ insights, loading }) {
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="animate-spin inline-block w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full mb-3" />
        <p className="text-sm">Asking our AI analyst...</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-500">
        AI insights are unavailable right now — but the analysis above tells you everything you need to know.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">AI Insights</h2>
      {Object.entries(CARD_STYLES).map(([key, style]) => (
        <div key={key} className={`rounded-xl border-l-4 ${style.border} ${style.bg} p-5`}>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{style.title}</div>
          <p className="text-sm text-gray-800 leading-relaxed">{insights[key]}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 10. Environment Variables

**backend/.env**
```
GEMINI_API_KEY=your_key_here
PORT=3001
```

**frontend/.env.local** (development)
```
VITE_API_BASE_URL=http://localhost:3001
```

**frontend — Vercel environment variable** (production)
```
VITE_API_BASE_URL=https://your-railway-app.railway.app
```

Get a Gemini API key free at: `https://aistudio.google.com/app/apikey`  
Free tier: 15 requests/min, 1M tokens/day — sufficient for a hackathon.

---

## 11. Deployment

### Backend (Railway)
```bash
cd backend
# Push to GitHub
# Connect repo to Railway
# Set GEMINI_API_KEY environment variable in Railway dashboard
# Railway auto-deploys on push
```

### Frontend (Vercel)
```bash
cd frontend
# Push to GitHub
# Connect repo to Vercel
# Set VITE_API_BASE_URL = https://your-app.railway.app in Vercel env vars
# Vercel auto-deploys on push
```

Both deploy in under 2 minutes from GitHub. HTTPS is automatic on both platforms.

---

## 12. 9-Hour Build Plan

| Hours | Task | Files |
|---|---|---|
| 0:00 – 0:30 | Scaffold: `npm create vite`, install deps, Tailwind CDN, init backend | Setup |
| 0:30 – 1:00 | Backend: `server.js` with `/api/funds` + `/api/insights` routes. Test with Postman | `server.js` |
| 1:00 – 2:00 | Core logic: `overlap.js` + test with console against known pairs. Verify numbers match pre-computed | `overlap.js` |
| 2:00 – 2:45 | Core logic: `sectorRisk.js` + `eli5.js` | `sectorRisk.js`, `eli5.js` |
| 2:45 – 3:15 | `demoPortfolios.js` with 3 sets and precomputed data | `demoPortfolios.js` |
| 3:15 – 4:15 | `DemoButtons.jsx` + `PortfolioInput.jsx` with fund search dropdown | Components |
| 4:15 – 5:15 | `OverlapMatrix.jsx` — matrix grid + shared stocks table | `OverlapMatrix.jsx` |
| 5:15 – 6:15 | `SectorChart.jsx` (Chart.js) + `CrashSimulator.jsx` (slider + live rupee) | Components |
| 6:15 – 6:45 | `ELI5Section.jsx` | `ELI5Section.jsx` |
| 6:45 – 7:30 | `AIInsights.jsx` + wire `App.jsx` state together end-to-end | `App.jsx`, `AIInsights.jsx` |
| 7:30 – 8:30 | Deploy backend to Railway, frontend to Vercel, set env vars | Deployment |
| 8:30 – 9:00 | Full demo run-through, test all 3 demo buttons, test manual input, test Gemini failure state | QA |

**Critical path:** Backend `/api/funds` must be running before `PortfolioInput` can be built. Start backend first.

---

## 13. Pre-Demo Testing Checklist

- [ ] All 3 demo buttons load the correct portfolio and trigger analysis
- [ ] Overlap numbers for Demo 1 (High) match: 69.6% / 65.6% / 67.2%
- [ ] Overlap matrix shows red cells for Demo 1, green/amber for Demo 3
- [ ] Sector bar chart renders on first load (not just after window resize)
- [ ] Crash slider updates rupee number in real time on every tick
- [ ] ELI5 section mentions a fund name and a rupee amount
- [ ] Gemini card loads within 5 seconds on good WiFi
- [ ] Gemini failure mode (wrong API key) shows graceful fallback, doesn't break page
- [ ] Manual fund search dropdown works — type "Parag" and see results
- [ ] Adding same fund twice shows a warning, prevents duplicate
- [ ] Works on 375px screen width (mobile)
- [ ] No console errors on fresh load
- [ ] Backend Railway URL is set in Vercel env vars (not localhost)

---

## 14. Cursor / Claude Code Prompt

Paste this at the start of your first Cursor session:

> Build a full-stack React + Node.js web app called MF Portfolio Analyzer. The complete PRD is in `PRD.md` and the technical spec is in `TRD.md`. The fund data file is `backend/data/funds.json`.
>
> Architecture: Express backend serving `/api/funds` and `/api/insights` (Gemini proxy). React + Vite frontend consuming those APIs. Gemini key is server-side only — never in frontend code.
>
> Start with the backend: `server.js` with both API routes. Then `overlap.js` and `sectorRisk.js` — test them in isolation with console.log before building any UI. Then build components in this order: DemoButtons → PortfolioInput → OverlapMatrix → SectorChart + CrashSimulator → ELI5Section → AIInsights → App.jsx wiring.
>
> The three demo portfolios are in `src/data/demoPortfolios.js` with hardcoded scheme codes and pre-computed overlap numbers. Use Tailwind CSS for all styling. Follow TRD function signatures and component props exactly.
