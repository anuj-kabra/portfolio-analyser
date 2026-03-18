import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FUND_FILE_MAP } from "./data/fundMap.js";
import { TICKER_SECTOR_MAP } from "./data/tickerSectorMap.js";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function toFundId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalizeSectorName(sectorName) {
  const value = String(sectorName || "").toLowerCase();
  if (!value) return "Other";
  if (value.includes("bank") || value.includes("nbfc") || value.includes("financial")) return "Banking";
  if (value.includes("insurance")) return "Insurance";
  if (value.includes("it") || value.includes("software") || value.includes("technology")) return "IT";
  if (value.includes("pharma") || value.includes("healthcare") || value.includes("hospital")) return "Pharma";
  if (value.includes("auto") || value.includes("tyre") || value.includes("tractor")) return "Auto";
  if (value.includes("fmcg") || value.includes("consumer")) return "FMCG";
  if (value.includes("metal") || value.includes("steel")) return "Metals";
  if (value.includes("realty") || value.includes("real estate")) return "Realty";
  if (value.includes("energy") || value.includes("oil") || value.includes("gas")) return "Energy";
  if (value.includes("infra") || value.includes("construction")) return "Infrastructure";
  if (value.includes("telecom")) return "Telecom";
  if (value.includes("media")) return "Media";
  if (value.includes("chemical")) return "Chemicals";
  if (value.includes("textile")) return "Textiles";
  if (value.includes("capital goods") || value.includes("machinery")) return "Capital Goods";
  return "Other";
}

function normalizeSectorWeights(rawSectorWeights) {
  const normalized = {};
  for (const [sector, value] of Object.entries(rawSectorWeights || {})) {
    const bucket = normalizeSectorName(sector);
    normalized[bucket] = (normalized[bucket] || 0) + (Number(value) || 0);
  }
  return Object.fromEntries(
    Object.entries(normalized)
      .map(([sector, weight]) => [sector, +weight.toFixed(2)])
      .sort((a, b) => b[1] - a[1])
  );
}

function createMockSiblingFund(baseFund, variantIndex) {
  const factorByMod = [0.94, 0.98, 1.02, 1.06, 1.0];
  const holdings = (baseFund.holdings || [])
    .map((holding, index) => {
      const factor = factorByMod[(index + variantIndex) % factorByMod.length];
      return {
        ...holding,
        weight: +(holding.weight * factor).toFixed(4),
      };
    })
    .sort((a, b) => b.weight - a.weight);

  const normalizedSectorWeights = {};
  for (const [sector, weight] of Object.entries(baseFund.normalizedSectorWeights || {})) {
    const factor = factorByMod[(sector.length + variantIndex) % factorByMod.length];
    normalizedSectorWeights[sector] = +((Number(weight) || 0) * factor).toFixed(2);
  }

  return {
    ...baseFund,
    id: `${baseFund.id}-mock-${variantIndex}`,
    name: `${baseFund.name} (Mock Alt ${variantIndex})`,
    amc: `${baseFund.amc} Labs`,
    ter: +(Math.max(baseFund.ter - 0.08 + variantIndex * 0.02, 0.2)).toFixed(2),
    sourceFile: `${baseFund.sourceFile}#mock-${variantIndex}`,
    holdings,
    normalizedSectorWeights,
    isMock: true,
  };
}

function loadFundsFromDatasets() {
  const datasetsDir = join(__dirname, "..", "data", "datasets");
  const funds = [];

  for (const [fundName, meta] of Object.entries(FUND_FILE_MAP)) {
    try {
      const fullPath = join(datasetsDir, meta.file);
      const raw = JSON.parse(readFileSync(fullPath, "utf8"));
      const constituents = Array.isArray(raw.constituents) ? raw.constituents : [];
      const sectorWeights = raw.sectorWeights && typeof raw.sectorWeights === "object" ? raw.sectorWeights : {};

      const holdings = constituents
        .filter((item) => item?.type === "Equity" && item?.ticker && Number(item?.weight) > 0)
        .map((item) => ({
          ticker: String(item.ticker).trim().toUpperCase(),
          name: item.title ?? item.ticker,
          weight: Number(item.weight) || 0,
          normalizedSector: normalizeSectorName(TICKER_SECTOR_MAP[String(item.ticker).trim().toUpperCase()] || "Other"),
        }))
        .sort((a, b) => b.weight - a.weight);

      const normalizedSectorWeights = normalizeSectorWeights(sectorWeights);

      funds.push({
        id: toFundId(fundName),
        name: fundName,
        amc: meta.amc,
        category: meta.category,
        ter: Number(meta.ter) || 0.6,
        sourceFile: meta.file,
        holdings,
        sectorWeights,
        normalizedSectorWeights,
      });
    } catch (error) {
      console.error(`Failed to load ${meta.file}:`, error.message);
    }
  }

  const withMocks = [...funds];
  funds.forEach((fund, index) => {
    withMocks.push(createMockSiblingFund(fund, (index % 2) + 1));
  });

  return withMocks;
}

const funds = loadFundsFromDatasets();
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const GEMINI_MODEL_FALLBACKS = (process.env.GEMINI_MODEL_FALLBACKS || "gemini-2.0-flash,gemini-1.5-flash")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.get("/api/funds", (req, res) => {
  res.json(funds);
});

function parseGeminiJson(text) {
  const clean = String(text ?? "").replace(/```json|```/g, "").trim();
  if (!clean) return null;

  try {
    return JSON.parse(clean);
  } catch {
    const jsonStart = clean.indexOf("{");
    const jsonEnd = clean.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      try {
        return JSON.parse(clean.slice(jsonStart, jsonEnd + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function buildFallbackInsights() {
  return {
    concentrated:
      "Your portfolio has visible concentration in a few sectors, so a single sector shock can create outsized short-term losses.",
    redundant:
      "Some selected funds hold overlapping stocks, which reduces true diversification despite different fund names.",
    recommendation:
      "Reduce one highly overlapping fund and replace it with a lower-overlap option from the same category to spread risk better.",
    ghostInsight:
      "Your merged holdings show hidden duplication across funds, so the effective portfolio is less diversified than it appears.",
    riskInsight:
      "Rupee-at-risk represents a realistic bad-month downside estimate; use it as a risk budget check before adding similar funds.",
    aiUnavailable: true,
  };
}

app.post("/api/insights", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI service not configured" });
  }

  const portfolioSummary = req.body?.portfolioSummary ?? "";
  const overlapSummary = req.body?.overlapSummary ?? "";
  const sectorSummary = req.body?.sectorSummary ?? "";
  const availableFunds = req.body?.availableFunds ?? [];
  const ghostSummary = req.body?.ghostSummary ?? "";
  const varSummary = req.body?.varSummary ?? "";

  const availableFundsText = Array.isArray(availableFunds)
    ? availableFunds.join(", ")
    : String(availableFunds);

  const prompt = `You are a friendly Indian mutual fund analyst explaining portfolio analysis to a beginner investor.
Be direct, specific, and simple. Use rupee amounts where useful. No jargon.
Max 2 sentences per field.

Portfolio:
${portfolioSummary}

Fund overlap:
${overlapSummary}

Sector exposure:
${sectorSummary}

Replacement funds available (same category, not in portfolio): ${availableFundsText}

Ghost portfolio summary:
${ghostSummary}

Rupee-at-Risk summary:
${varSummary}

Respond ONLY with valid JSON:
{
  "concentrated": "What is concentrated and why it matters.",
  "redundant": "What is redundant in this portfolio.",
  "recommendation": "One clear action to improve diversification.",
  "ghostInsight": "What the merged ghost portfolio reveals in plain language.",
  "riskInsight": "What the rupee-at-risk number means in real life."
}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelsToTry = [GEMINI_MODEL, ...GEMINI_MODEL_FALLBACKS];
    let parsed = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        const text = response?.text ?? "";
        parsed = parseGeminiJson(text);
        if (parsed) {
          break;
        }
        lastError = new Error(`Model ${model} returned non-JSON response`);
      } catch (error) {
        lastError = error;
        console.error(`Gemini model ${model} failed:`, error.message);
      }
    }

    if (!parsed) {
      if (lastError) {
        console.error("Gemini error:", lastError.message);
      }
      return res.json(buildFallbackInsights());
    }

    res.json({
      concentrated: parsed.concentrated ?? "Could not determine concentration details right now.",
      redundant: parsed.redundant ?? "Could not determine overlap redundancy right now.",
      recommendation: parsed.recommendation ?? "Could not generate a recommendation right now.",
      ghostInsight: parsed.ghostInsight ?? "Your merged holdings reveal hidden duplication across funds.",
      riskInsight: parsed.riskInsight ?? "Your rupee-at-risk is a practical estimate of bad-month downside.",
    });
  } catch (error) {
    console.error("Gemini error:", error.message);
    res.json(buildFallbackInsights());
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Loaded ${funds.length} funds from dataset map.`);
  console.log(`Gemini model configured: ${GEMINI_MODEL}`);
  console.log(`Gemini fallback models: ${GEMINI_MODEL_FALLBACKS.join(", ")}`);
});
