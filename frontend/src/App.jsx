import { useEffect, useMemo, useState } from "react";
import DemoButtons from "./components/DemoButtons";
import PortfolioInput from "./components/PortfolioInput";
import OverlapMatrix from "./components/OverlapMatrix";
import SectorChart from "./components/SectorChart";
import CrashSimulator from "./components/CrashSimulator";
import ELI5Section from "./components/ELI5Section";
import AIInsights from "./components/AIInsights";
import { DEMO_PORTFOLIOS } from "./data/demoPortfolios";
import { analyseOverlap } from "./lib/overlap";
import { computeSectorExposure } from "./lib/sectorRisk";
import { generateELI5 } from "./lib/eli5";

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? "";
}

export default function App() {
  const [allFunds, setAllFunds] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [results, setResults] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiInsights, setGeminiInsights] = useState(null);
  const [fundsError, setFundsError] = useState("");
  const [insightsError, setInsightsError] = useState("");

  useEffect(() => {
    async function loadFunds() {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/funds`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAllFunds(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch funds:", error);
        setFundsError("Could not load funds from backend.");
      }
    }
    loadFunds();
  }, []);

  async function runAnalysis(port) {
    setIsAnalysing(true);
    setGeminiInsights(null);
    setInsightsError("");
    try {
      const safePortfolio = port.filter((item) => item?.fund && Number(item?.amount) > 0);
      const overlap = analyseOverlap(safePortfolio);
      const sectorExposure = computeSectorExposure(safePortfolio);
      const eli5 = generateELI5(safePortfolio, overlap, sectorExposure);
      const totalInvested = safePortfolio.reduce((sum, item) => sum + item.amount, 0);

      setResults({ overlap, sectorExposure, eli5, totalInvested });
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      setIsAnalysing(false);

      setGeminiLoading(true);
      const insights = await fetchGeminiInsights(safePortfolio, overlap, sectorExposure);
      if (!insights) {
        setInsightsError("AI unavailable");
      }
      setGeminiInsights(insights);
      setGeminiLoading(false);
    } catch (error) {
      console.error("Analysis failed:", error);
      setIsAnalysing(false);
      setGeminiLoading(false);
    }
  }

  async function fetchGeminiInsights(port, overlap, sectorExposure) {
    try {
      const categories = new Set(port.map((item) => item.fund.category));
      const selectedIds = new Set(port.map((item) => item.fund.id));
      const availableFunds = allFunds
        .filter((fund) => !selectedIds.has(fund.id) && categories.has(fund.category))
        .map((fund) => fund.name)
        .slice(0, 5);

      const portfolioSummary = port
        .map((item) => `- ${item.fund.name}: INR ${item.amount.toLocaleString("en-IN")}`)
        .join("\n");
      const overlapSummary = overlap.pairs
        .map((pair) => `- ${pair.fundA} vs ${pair.fundB}: ${pair.overlapPct}%`)
        .join("\n");
      const sectorSummary = Object.entries(sectorExposure)
        .slice(0, 5)
        .map(([sector, data]) => `- ${sector}: ${data.weightPct}% (INR ${data.rupeeAmount.toLocaleString("en-IN")})`)
        .join("\n");

      const res = await fetch(`${getApiBaseUrl()}/api/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioSummary, overlapSummary, sectorSummary, availableFunds }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Gemini insights failed:", error);
      return null;
    }
  }

  function handleDemo(demoKey) {
    const demo = DEMO_PORTFOLIOS[demoKey];
    const demoPortfolio = demo.entries
      .map((entry) => ({
        fund: allFunds.find((fund) => fund.id === entry.fundId),
        amount: entry.amount,
      }))
      .filter((entry) => entry.fund);

    setPortfolio(demoPortfolio);
    runAnalysis(demoPortfolio);
  }

  const hasResults = useMemo(() => Boolean(results?.overlap), [results]);

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
        {/* Header */}
        <header className="mb-14 animate-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-xs text-[#a0a0a6] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            MF Portfolio Analyzer
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15]">
            See hidden overlap, sector risk<br className="hidden sm:block" /> &amp; clear next steps
          </h1>
          <p className="mt-4 text-[15px] text-[#5c5c63] max-w-xl leading-relaxed">
            Add 2–6 mutual funds, compare stock overlap, simulate a sector crash, and get a plain-English summary.
          </p>
        </header>

        {/* Error */}
        {fundsError ? (
          <div className="mb-8 card px-4 py-3 text-sm text-amber-400/80 border-amber-500/20 animate-in">
            {fundsError}
          </div>
        ) : null}

        {/* Demo */}
        <div className="animate-in delay-1">
          <DemoButtons onDemo={handleDemo} disabled={allFunds.length === 0} />
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-white/[0.06]" />

        {/* Input */}
        <div className="animate-in delay-2">
          <PortfolioInput
            allFunds={allFunds}
            portfolio={portfolio}
            onPortfolioChange={setPortfolio}
            onAnalyse={() => runAnalysis(portfolio)}
            isAnalysing={isAnalysing}
          />
        </div>

        {/* Results */}
        {hasResults ? (
          <section id="results" className="mt-14 space-y-10">
            <div className="animate-in"><OverlapMatrix overlap={results.overlap} /></div>
            <div className="animate-in delay-1"><SectorChart sectorExposure={results.sectorExposure} /></div>
            <div className="animate-in delay-2"><CrashSimulator totalInvested={results.totalInvested} sectorExposure={results.sectorExposure} /></div>
            <div className="animate-in delay-3"><ELI5Section eli5={results.eli5} /></div>
            <div className="animate-in delay-4"><AIInsights insights={geminiInsights} loading={geminiLoading} error={insightsError} /></div>
          </section>
        ) : null}

        <footer className="mt-20 pt-6 border-t border-white/[0.04] text-center text-xs text-[#3a3a40]">
          Built with React &amp; Gemini AI · Data for educational purposes only
        </footer>
      </main>
    </div>
  );
}
