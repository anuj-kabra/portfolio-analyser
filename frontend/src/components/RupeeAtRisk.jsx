import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { varSummaryText } from "../lib/rupeeAtRisk";

const INR = new Intl.NumberFormat("en-IN");

const TIER_COLORS = ["#f59e0b", "#ef4444", "#dc2626"];

export default function RupeeAtRisk({ varResult }) {
  if (!varResult) return null;
  const summary = varSummaryText(varResult);

  const tiers = [varResult.var95, varResult.var99, varResult.var999];
  const chartData = tiers.map((t) => ({
    name: t.label.split(" (")[0],
    rupees: t.rupees,
    pct: t.pct,
    label: t.label,
  }));

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-white">Portfolio Risk — Value at Risk (VaR)</h2>

      <div className="card p-4 border-white/[0.06] bg-white/[0.02] text-sm text-[#a0a0a6] leading-relaxed">
        <p>
          VaR estimates the maximum likely loss in a single month. We build a sector-weighted covariance matrix using
          each sector&apos;s historical annualised volatility and pairwise correlations. The three tiers represent
          statistical confidence levels: 95% (once every ~2 years), 99% (once per decade), 99.9% (black swan).
        </p>
      </div>

      <div className="card p-5 border-amber-500/20 bg-amber-500/[0.05]">
        <div className="text-xs text-amber-400/80 mb-1">Bad month estimate (95% VaR)</div>
        <div className="text-3xl font-semibold text-amber-300">-INR {INR.format(varResult.var95.rupees)}</div>
        <div className="text-xs text-[#a0a0a6] mt-1">{summary.detail}</div>
      </div>

      <div className="card p-4">
        <div className="text-xs text-[#5c5c63] mb-3">Loss by confidence tier</div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis type="number" tickFormatter={(v) => `INR ${(v / 1000).toFixed(0)}k`} stroke="#5c5c63" fontSize={10} />
              <YAxis type="category" dataKey="name" width={80} stroke="#5c5c63" fontSize={10} tick={{ fill: "#a0a0a6" }} />
              <Tooltip
                cursor={false}
                contentStyle={{ backgroundColor: "#1a1a1b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                labelStyle={{ color: "#ececed" }}
                itemStyle={{ color: "#a0a0a6" }}
                formatter={(value) => [`-INR ${INR.format(value)}`, "Loss"]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.label}
              />
              <Bar dataKey="rupees" radius={[0, 4, 4, 0]} activeBar={false}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={TIER_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
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
