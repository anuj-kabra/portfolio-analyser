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
        body: JSON.stringify({
          portfolioSummary,
          overlapSummary,
          sectorSummary,
          availableFunds,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

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
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        <header className="mb-8">
          <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700 mb-4">
            MF Portfolio Analyzer
          </p>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-gray-900">
            See hidden mutual fund overlap, sector risk, and clear next steps
          </h1>
          <p className="mt-4 text-gray-600 max-w-3xl">
            Add 2 to 6 funds, compare stock overlap by ticker, simulate a sector crash in rupees, and get a plain-English
            summary.
          </p>
        </header>

        {fundsError ? (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">{fundsError}</div>
        ) : null}

        <DemoButtons onDemo={handleDemo} disabled={allFunds.length === 0} />

        <div className="my-8 border-t border-gray-200" />

        <PortfolioInput
          allFunds={allFunds}
          portfolio={portfolio}
          onPortfolioChange={setPortfolio}
          onAnalyse={() => runAnalysis(portfolio)}
          isAnalysing={isAnalysing}
        />

        {hasResults ? (
          <section id="results" className="mt-10 space-y-10">
            <OverlapMatrix overlap={results.overlap} />
            <SectorChart sectorExposure={results.sectorExposure} />
            <CrashSimulator totalInvested={results.totalInvested} sectorExposure={results.sectorExposure} />
            <ELI5Section eli5={results.eli5} />
            <AIInsights insights={geminiInsights} loading={geminiLoading} error={insightsError} />
          </section>
        ) : null}
      </main>
    </div>
  );
}
