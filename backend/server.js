import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FUND_FILE_MAP } from "./data/fundMap.js";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function toFundId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
        }))
        .sort((a, b) => b.weight - a.weight);

      funds.push({
        id: toFundId(fundName),
        name: fundName,
        amc: meta.amc,
        category: meta.category,
        sourceFile: meta.file,
        holdings,
        sectorWeights,
      });
    } catch (error) {
      console.error(`Failed to load ${meta.file}:`, error.message);
    }
  }

  return funds;
}

const funds = loadFundsFromDatasets();
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

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

app.post("/api/insights", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI service not configured" });
  }

  const portfolioSummary = req.body?.portfolioSummary ?? "";
  const overlapSummary = req.body?.overlapSummary ?? "";
  const sectorSummary = req.body?.sectorSummary ?? "";
  const availableFunds = req.body?.availableFunds ?? [];

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

Respond ONLY with valid JSON:
{
  "concentrated": "What is concentrated and why it matters.",
  "redundant": "What is redundant in this portfolio.",
  "recommendation": "One clear action to improve diversification."
}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const text = response?.text ?? "";
    const parsed = parseGeminiJson(text);

    if (!parsed) {
      throw new Error("Gemini returned non-JSON response");
    }

    res.json({
      concentrated: parsed.concentrated ?? "Could not determine concentration details right now.",
      redundant: parsed.redundant ?? "Could not determine overlap redundancy right now.",
      recommendation: parsed.recommendation ?? "Could not generate a recommendation right now.",
    });
  } catch (error) {
    console.error("Gemini error:", error.message);
    res.status(502).json({ error: "AI service unavailable" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Loaded ${funds.length} funds from dataset map.`);
  console.log(`Gemini model configured: ${GEMINI_MODEL}`);
});
