import { useMemo, useState } from "react";
import { simulateContagion } from "../lib/contagion";

const INR = new Intl.NumberFormat("en-IN");

export default function ContagionMap({ totalInvested, sectorExposure }) {
  const sectors = useMemo(() => Object.keys(sectorExposure || {}), [sectorExposure]);
  const [triggerSector, setTriggerSector] = useState("");
  const [crashPct, setCrashPct] = useState(30);
  const activeSector = sectors.includes(triggerSector) ? triggerSector : sectors[0] || "";
  const result = simulateContagion(totalInvested, sectorExposure, activeSector, crashPct);

  if (!activeSector) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-white">Contagion Map</h2>

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

      <div className="card p-4 space-y-2">
        {result.cascade.map((item) => (
          <div key={item.sector} className="flex items-center text-xs">
            <span className={`w-2.5 h-2.5 rounded-full mr-2 ${item.type === "direct" ? "bg-red-500" : "bg-amber-400"}`} />
            <span className="w-28 text-[#a0a0a6] truncate">
              {item.sector}
              {item.type === "contagion" ? ` (rho ${item.correlation.toFixed(2)})` : ""}
            </span>
            <div className="flex-1 mx-2 h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className={`${item.type === "direct" ? "bg-red-400" : "bg-amber-300"} h-full`}
                style={{ width: `${(Math.min(item.crashPct, 60) / 60) * 100}%` }}
              />
            </div>
            <span className="w-16 text-right text-red-300">-INR {INR.format(item.lossRupees)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
