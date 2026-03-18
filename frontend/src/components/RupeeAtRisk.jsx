import { varSummaryText } from "../lib/rupeeAtRisk";

const INR = new Intl.NumberFormat("en-IN");

export default function RupeeAtRisk({ varResult }) {
  if (!varResult) return null;
  const summary = varSummaryText(varResult);

  const tiers = [varResult.var95, varResult.var99, varResult.var999];

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-white">Rupee-at-Risk</h2>

      <div className="card p-5 border-amber-500/20 bg-amber-500/[0.05]">
        <div className="text-xs text-amber-400/80 mb-1">Bad month estimate</div>
        <div className="text-3xl font-semibold text-amber-300">-INR {INR.format(varResult.var95.rupees)}</div>
        <div className="text-xs text-[#a0a0a6] mt-1">{summary.detail}</div>
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        {tiers.map((tier) => (
          <div key={tier.label} className="card p-4">
            <div className="text-[11px] text-[#5c5c63] mb-1">{tier.label}</div>
            <div className="text-lg font-semibold text-red-400">-INR {INR.format(tier.rupees)}</div>
            <div className="text-xs text-[#5c5c63] mt-0.5">{tier.pct}% of portfolio</div>
          </div>
        ))}
      </div>

      <div className="text-xs text-[#5c5c63]">
        Portfolio volatility: <span className="text-[#a0a0a6]">{varResult.annualVolPct}% annualised</span> |{" "}
        <span className="text-[#a0a0a6]">{varResult.monthlyVolPct}% monthly</span>
      </div>

      <div className="text-sm text-[#a0a0a6] leading-relaxed">
        <p>{summary.headline}</p>
        <p className="mt-2">{summary.worstCase}</p>
      </div>
    </section>
  );
}
