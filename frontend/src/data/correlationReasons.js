/** Human-readable explanations for why sectors correlate with each other */
export const CORRELATION_REASONS = {
  "Banking|Insurance": "Banks and insurers share exposure to interest rates and credit cycles; stress in one often spills to the other.",
  "Banking|Realty": "Real estate developers rely on bank credit; a banking crisis tightens housing loans and hurts realty.",
  "Banking|Infrastructure": "Infrastructure projects depend on bank financing; credit stress delays or cancels projects.",
  "Banking|Capital Goods": "Capital goods firms finance equipment via banks; credit tightening reduces orders.",
  "IT|Telecom": "IT services and telecom are both tech-heavy; shared investor base and similar growth drivers.",
  "Auto|Metals": "Auto manufacturers are heavy consumers of steel and aluminium; metal prices directly affect margins.",
  "Auto|Capital Goods": "Auto plants use machinery from capital goods firms; capex cuts hit both sectors.",
  "Metals|Energy": "Smelting and processing are energy-intensive; energy prices directly affect metal margins.",
  "Metals|Infrastructure": "Infrastructure demand drives steel and cement; construction slowdown hits metals.",
  "Energy|Chemicals": "Chemicals are energy-intensive; feedstock and power costs link the two sectors.",
  "Infrastructure|Capital Goods": "Capital goods companies supply machinery to infrastructure projects; orders move together.",
  "Infrastructure|Realty": "Real estate and infrastructure share construction cycles and financing sources.",
  "FMCG|Other": "FMCG and diversified sectors share consumer demand sensitivity.",
  "Pharma|Other": "Pharma and diversified sectors share defensive characteristics and similar investor flows.",
};

export function getCorrelationReason(triggerSector, affectedSector) {
  return CORRELATION_REASONS[`${triggerSector}|${affectedSector}`] || CORRELATION_REASONS[`${affectedSector}|${triggerSector}`];
}
