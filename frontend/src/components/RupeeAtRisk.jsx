import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { varSummaryText, panicModeCalc, sipMonthsLost } from "../lib/rupeeAtRisk";

const INR = new Intl.NumberFormat("en-IN");

const TIER_COLORS = ["#f59e0b", "#ef4444", "#dc2626"];

export default function RupeeAtRisk({ varResult, riskBudget }) {
  const [panicMultiplier, setPanicMultiplier] = useState(1.0);
  const [monthlySip, setMonthlySip] = useState("");

  if (!varResult) return null;
  const summary = varSummaryText(varResult);

  const panicResult = panicMultiplier > 1 ? panicModeCalc(varResult, panicMultiplier) : null;
  const displayVar = panicResult || varResult;

  const sipNum = Number(monthlySip) || 0;
  const sipLost = sipNum > 0 ? sipMonthsLost(varResult, sipNum) : null;

  const tiers = [displayVar.var95, displayVar.var99, displayVar.var999];
  const baseTiers = [varResult.var95, varResult.var99, varResult.var999];
  const chartData = tiers.map((t, i) => ({
    name: baseTiers[i].label.split(" (")[0],
    rupees: t.rupees,
    pct: t.pct,
    label: baseTiers[i].label,
  }));

  const maxRiskBudget = riskBudget?.[0]?.riskContribution || 0;

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

      {/* Panic Mode */}
      <div className="card p-4 border-red-500/20 bg-red-500/[0.04]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-white">Panic Mode</h3>
          <span className="text-[11px] text-red-300/80">
            {panicMultiplier > 1 ? `${panicMultiplier}× amplifier active` : "Normal market conditions"}
          </span>
        </div>
        <p className="text-[11px] text-[#a0a0a6] mb-3">
          During market panics, correlations spike and losses exceed normal VaR. This multiplier models that effect.
        </p>
        <div className="flex items-center gap-4">
          <label className="text-[11px] text-[#5c5c63] w-8 shrink-0">{panicMultiplier}×</label>
          <input
            type="range"
            min="1.0"
            max="3.0"
            step="0.1"
            value={panicMultiplier}
            onChange={(e) => setPanicMultiplier(+Number(e.target.value).toFixed(1))}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => setPanicMultiplier(1.0)}
            className="text-[11px] text-[#5c5c63] hover:text-[#a0a0a6] px-2"
          >
            Reset
          </button>
        </div>
        {panicResult && (
          <p className="mt-2 text-xs text-red-300/80">
            In a panic scenario your 95% VaR rises from INR {INR.format(varResult.var95.rupees)} to{" "}
            <span className="font-medium text-red-300">INR {INR.format(panicResult.var95.rupees)}</span>.
          </p>
        )}
      </div>

      <div className="card p-5 border-amber-500/20 bg-amber-500/[0.05]">
        <div className="text-xs text-amber-400/80 mb-1">Bad month estimate (95% VaR{panicResult ? ` · ${panicMultiplier}× panic` : ""})</div>
        <div className="text-3xl font-semibold text-amber-300">-INR {INR.format(displayVar.var95.rupees)}</div>
        <div className="text-xs text-[#a0a0a6] mt-1">{summary.detail}</div>

        {/* SIP months context */}
        {sipLost && (
          <div className="mt-3 pt-3 border-t border-amber-500/10 text-xs text-[#a0a0a6]">
            A bad month wipes out{" "}
            <span className="text-amber-300 font-medium">{sipLost.months95} months</span> of your INR{" "}
            {INR.format(sipNum)} monthly SIP.
          </div>
        )}
      </div>

      {/* SIP Months Input */}
      <div className="card p-4">
        <h3 className="text-xs font-medium text-white mb-2">SIP Context</h3>
        <p className="text-[11px] text-[#a0a0a6] mb-3">
          Enter your monthly SIP to see how many months of investment a loss event would wipe out.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#5c5c63] shrink-0">INR</span>
          <input
            type="number"
            min="0"
            step="500"
            placeholder="e.g. 10000"
            value={monthlySip}
            onChange={(e) => setMonthlySip(e.target.value)}
            className="flex-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[#ececed] px-3 py-2 text-sm"
          />
          <span className="text-[11px] text-[#5c5c63] shrink-0">/ month</span>
        </div>
        {sipLost && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "95% VaR", months: sipLost.months95, color: "text-amber-400" },
              { label: "99% VaR", months: sipLost.months99, color: "text-red-400" },
              { label: "99.9% VaR", months: sipLost.months999, color: "text-red-500" },
            ].map((t) => (
              <div key={t.label} className="card p-2">
                <div className="text-[10px] text-[#5c5c63]">{t.label}</div>
                <div className={`text-base font-medium ${t.color}`}>{t.months} mo</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4">
        <div className="text-xs text-[#5c5c63] mb-3">Loss by confidence tier{panicResult ? ` (${panicMultiplier}× panic)` : ""}</div>
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
        {tiers.map((tier, i) => (
          <div key={baseTiers[i].label} className="card p-4">
            <div className="text-[11px] text-[#5c5c63] mb-1">{baseTiers[i].label}</div>
            <div className="text-lg font-semibold text-red-400">-INR {INR.format(tier.rupees)}</div>
            <div className="text-xs text-[#5c5c63] mt-0.5">{tier.pct}% of portfolio</div>
          </div>
        ))}
      </div>

      {/* Risk Budget by Sector */}
      {riskBudget?.length > 0 && (
        <div className="card p-4">
          <h3 className="text-xs font-medium text-white mb-3">Risk Budget by Sector</h3>
          <p className="text-[11px] text-[#a0a0a6] mb-3">
            Beta-weighted contribution of each sector to your total VaR. High-beta sectors punch above their weight.
          </p>
          <div className="space-y-2">
            {riskBudget.slice(0, 8).map((rb) => (
              <div key={rb.sector} className="flex items-center gap-3">
                <span className="text-[11px] text-[#a0a0a6] w-24 shrink-0">{rb.sector}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.05]">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-red-500 to-red-400"
                    style={{ width: `${maxRiskBudget > 0 ? (rb.riskContribution / maxRiskBudget) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#5c5c63] w-8 text-right">{rb.riskContribution}%</span>
                <span className="text-[10px] text-[#5c5c63] w-16 text-right">β {rb.beta}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
