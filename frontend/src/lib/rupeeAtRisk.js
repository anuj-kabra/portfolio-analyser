import { DEFAULT_VOLATILITY, SECTOR_VOLATILITY } from "../data/sectorVolatility.js";
import { getCorrelationMap } from "../data/sectorCorrelations.js";

const corrMap = getCorrelationMap();

function fmt(amount) {
  return `INR ${amount.toLocaleString("en-IN")}`;
}

export function computeRupeeAtRisk(totalInvested, sectorExposure) {
  const sectors = Object.entries(sectorExposure || {});
  if (!totalInvested || sectors.length === 0) {
    return {
      totalInvested,
      annualVolPct: 0,
      monthlyVolPct: 0,
      var95: { pct: 0, rupees: 0, label: "Bad month (once every ~2 years)" },
      var99: { pct: 0, rupees: 0, label: "Really bad month (once per decade)" },
      var999: { pct: 0, rupees: 0, label: "Black swan (once per 30 years)" },
    };
  }

  let variance = 0;
  for (let i = 0; i < sectors.length; i += 1) {
    const [sectorI, dataI] = sectors[i];
    const wi = (dataI.weightPct || 0) / 100;
    const sigmaI = (SECTOR_VOLATILITY[sectorI] || DEFAULT_VOLATILITY) / 100;
    for (let j = 0; j < sectors.length; j += 1) {
      const [sectorJ, dataJ] = sectors[j];
      const wj = (dataJ.weightPct || 0) / 100;
      const sigmaJ = (SECTOR_VOLATILITY[sectorJ] || DEFAULT_VOLATILITY) / 100;
      const rho = i === j ? 1 : corrMap.get(`${sectorI}|${sectorJ}`) ?? 0.3;
      variance += wi * wj * sigmaI * sigmaJ * rho;
    }
  }

  const annualVol = Math.sqrt(Math.max(variance, 0));
  const monthlyVol = annualVol / Math.sqrt(12);
  const var95 = monthlyVol * 1.645;
  const var99 = monthlyVol * 2.326;
  const var999 = monthlyVol * 3.09;

  return {
    totalInvested,
    annualVolPct: +(annualVol * 100).toFixed(1),
    monthlyVolPct: +(monthlyVol * 100).toFixed(1),
    var95: { pct: +(var95 * 100).toFixed(1), rupees: Math.round(totalInvested * var95), label: "Bad month (once every ~2 years)" },
    var99: { pct: +(var99 * 100).toFixed(1), rupees: Math.round(totalInvested * var99), label: "Really bad month (once per decade)" },
    var999: { pct: +(var999 * 100).toFixed(1), rupees: Math.round(totalInvested * var999), label: "Black swan (once per 30 years)" },
  };
}

export function varSummaryText(varResult) {
  return {
    headline: `In a bad month, you could lose up to ${fmt(varResult.var95.rupees)}.`,
    detail: `That is ${varResult.var95.pct}% of your portfolio and can happen roughly once every two years.`,
    worstCase: `In a once-per-decade bad month, downside could reach ${fmt(varResult.var99.rupees)}.`,
  };
}
