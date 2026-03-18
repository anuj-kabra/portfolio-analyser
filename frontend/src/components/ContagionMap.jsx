import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { simulateContagion } from "../lib/contagion";
import { getCorrelationReason } from "../data/correlationReasons";

const INR = new Intl.NumberFormat("en-IN");

export default function ContagionMap({ totalInvested, sectorExposure }) {
  const sectors = useMemo(() => Object.keys(sectorExposure || {}), [sectorExposure]);
  const [triggerSector, setTriggerSector] = useState("");
  const [crashPct, setCrashPct] = useState(30);
  const activeSector = sectors.includes(triggerSector) ? triggerSector : sectors[0] || "";
  const result = simulateContagion(totalInvested, sectorExposure, activeSector, crashPct);

  const chartData = result.cascade.map((item) => ({
    sector: item.sector + (item.type === "contagion" ? ` (ρ ${item.correlation.toFixed(2)})` : ""),
    lossRupees: item.lossRupees,
    type: item.type,
  }));

  const contagionPairs = result.cascade.filter((c) => c.type === "contagion");
  const reasonCards = contagionPairs
    .map((c) => {
      const reason = getCorrelationReason(activeSector, c.sector);
      return reason ? { sector: c.sector, correlation: c.correlation, reason } : null;
    })
    .filter(Boolean);

  if (!activeSector) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-white">Contagion Map</h2>

      <p className="text-sm text-[#a0a0a6] leading-relaxed">
        Models how a shock in one sector spreads to correlated sectors. Correlation (ρ) is sourced from historical
        co-movement of NSE sectoral indices.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card p-3">
          <label className="text-xs text-[#5c5c63]">If sector drops</label>
          <select
            value={activeSector}
            onChange={(e) => setTriggerSector(e.target.value)}
            className="w-full mt-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[#ececed] px-3 py-2 text-sm"
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector} className="bg-[#141415]">
                {sector}
              </option>
            ))}
          </select>
        </div>
        <div className="card p-3">
          <label className="text-xs text-[#5c5c63]">Crash severity {crashPct}%</label>
          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={crashPct}
            onChange={(e) => setCrashPct(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="text-xs text-[#5c5c63] mb-1">Simple model</div>
          <div className="text-xl text-[#ececed]">-INR {INR.format(result.simpleModelLoss)}</div>
        </div>
        <div className="card p-4 border-red-500/20 bg-red-500/[0.05]">
          <div className="text-xs text-red-300/80 mb-1">With contagion</div>
          <div className="text-xl text-red-300">-INR {INR.format(result.totalLoss)}</div>
          <div className="text-xs text-red-300/80 mt-1">
            Underestimate: INR {INR.format(result.underestimation)} ({result.underestimationPct}%)
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="text-xs text-[#5c5c63] mb-3">Sector loss by type</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis type="number" tickFormatter={(v) => `INR ${(v / 1000).toFixed(0)}k`} stroke="#5c5c63" fontSize={10} />
              <YAxis type="category" dataKey="sector" width={120} stroke="#5c5c63" fontSize={10} tick={{ fill: "#a0a0a6" }} />
              <Tooltip
                cursor={false}
                contentStyle={{ backgroundColor: "#1a1a1b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                labelStyle={{ color: "#ececed" }}
                itemStyle={{ color: "#a0a0a6" }}
                formatter={(value) => [`-INR ${INR.format(value)}`, "Loss"]}
              />
              <Bar dataKey="lossRupees" radius={[0, 4, 4, 0]} activeBar={false}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.type === "direct" ? "#ef4444" : "#f59e0b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 text-[11px] text-[#5c5c63]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Direct
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Contagion
          </span>
        </div>
      </div>

      {reasonCards.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-white">Why these sectors move together</h3>
          {reasonCards.map((card) => (
            <div key={card.sector} className="card p-3 border-white/[0.06]">
              <div className="text-xs text-amber-400/90">
                {activeSector} → {card.sector} (ρ {card.correlation.toFixed(2)})
              </div>
              <p className="text-xs text-[#a0a0a6] mt-1">{card.reason}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
