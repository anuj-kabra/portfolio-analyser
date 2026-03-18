export const SECTOR_CORRELATIONS = [
  ["Banking", "Insurance", 0.74],
  ["Banking", "Realty", 0.68],
  ["Banking", "Infrastructure", 0.62],
  ["Banking", "Capital Goods", 0.58],
  ["IT", "Telecom", 0.58],
  ["Auto", "Metals", 0.55],
  ["Auto", "Capital Goods", 0.65],
  ["Metals", "Energy", 0.62],
  ["Metals", "Infrastructure", 0.58],
  ["Energy", "Chemicals", 0.56],
  ["Infrastructure", "Capital Goods", 0.72],
  ["Infrastructure", "Realty", 0.64],
  ["FMCG", "Other", 0.51],
  ["Pharma", "Other", 0.52],
];

export function getCorrelationMap() {
  const map = new Map();
  for (const [a, b, corr] of SECTOR_CORRELATIONS) {
    map.set(`${a}|${b}`, corr);
    map.set(`${b}|${a}`, corr);
  }
  return map;
}
