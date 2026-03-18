import { useMemo, useState } from "react";
import { simulateCrash } from "../lib/sectorRisk";

const INR = new Intl.NumberFormat("en-IN");

export default function CrashSimulator({ totalInvested, sectorExposure }) {
  const sectors = useMemo(() => Object.keys(sectorExposure), [sectorExposure]);
  const [selectedSector, setSelectedSector] = useState("");
  const [crashPct, setCrashPct] = useState(30);
  const activeSector = sectors.includes(selectedSector) ? selectedSector : sectors[0] || "";
  const crash = simulateCrash(totalInvested, sectorExposure, activeSector, crashPct);

  if (sectors.length === 0) return null;

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-sm font-medium text-white mb-4">Crash simulator</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs text-[#5c5c63] mb-1.5">Sector</label>
          <select
            value={activeSector}
            onChange={(event) => setSelectedSector(event.target.value)}
            className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] text-[#ececed] px-3 py-2.5 text-sm focus:outline-none focus:border-white/20 transition-colors appearance-none"
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector} className="bg-[#141415]">{sector}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#5c5c63] mb-1.5">
            Severity: <span className="text-[#ececed]">{crashPct}%</span>
          </label>
          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={crashPct}
            onChange={(event) => setCrashPct(Number(event.target.value))}
            className="w-full mt-1"
          />
          <div className="flex justify-between text-[10px] text-[#3a3a40] mt-1">
            <span>10%</span>
            <span>60%</span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-red-500/[0.06] border border-red-500/10 p-4">
        <p className="text-xs text-[#5c5c63]">
          If <span className="text-[#ececed]">{activeSector}</span> drops <span className="text-red-400">{crashPct}%</span>
        </p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-xl font-semibold text-red-400">₹{INR.format(crash.rupeeLoss)}</span>
          <span className="text-xs text-[#5c5c63]">loss · {crash.portfolioPctLoss}% of portfolio</span>
        </div>
      </div>
    </section>
  );
}
