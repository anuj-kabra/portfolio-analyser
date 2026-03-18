export const DEMO_PORTFOLIOS = {
  high: {
    label: "Heavily Overlapped",
    badge: "High overlap",
    riskLevel: "high",
    entries: [
      { fundId: "axis-large-mid-cap-fund", amount: 200000 },
      { fundId: "mirae-asset-large-cap-fund", amount: 150000 },
      { fundId: "hdfc-flexi-cap-fund", amount: 150000 },
    ],
  },
  normal: {
    label: "Normal Overlapping",
    badge: "Moderate overlap",
    riskLevel: "medium",
    entries: [
      { fundId: "parag-parikh-flexi-cap-fund", amount: 200000 },
      { fundId: "hdfc-mid-cap-opportunities-fund", amount: 150000 },
      { fundId: "axis-large-mid-cap-fund", amount: 150000 },
    ],
  },
  low: {
    label: "Low Overlapping",
    badge: "Low overlap",
    riskLevel: "low",
    entries: [
      { fundId: "parag-parikh-flexi-cap-fund", amount: 200000 },
      { fundId: "nippon-india-small-cap-fund", amount: 150000 },
      { fundId: "sbi-small-cap-fund", amount: 150000 },
    ],
  },
};
