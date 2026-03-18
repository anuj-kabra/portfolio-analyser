import { useMemo, useState } from "react";
import { simulateCrash } from "../lib/sectorRisk";

const INR = new Intl.NumberFormat("en-IN");

export default function CrashSimulator({ totalInvested, sectorExposure }) {
  const sectors = useMemo(() => Object.keys(sectorExposure), [sectorExposure]);
  const [selectedSector, setSelectedSector] = useState("");
  const [crashPct, setCrashPct] = useState(30);
  const activeSector = sectors.includes(selectedSector) ? selectedSector : sectors[0] || "";
  const crash = simulateCrash(totalInvested, sectorExposure, activeSector, crashPct);

  if (sectors.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-gray-200 p-4 bg-gray-50">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Crash simulator</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <div className="text-gray-600 mb-1">Sector</div>
          <select
            value={activeSector}
            onChange={(event) => setSelectedSector(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <div className="text-gray-600 mb-1">Crash severity: {crashPct}%</div>
          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={crashPct}
            onChange={(event) => setCrashPct(Number(event.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <p className="mt-4 text-sm text-gray-800">
        If <span className="font-semibold">{activeSector}</span> drops{" "}
        <span className="font-semibold">{crashPct}%</span>, your portfolio loses{" "}
        <span className="font-semibold">INR {INR.format(crash.rupeeLoss)}</span> (
        {crash.portfolioPctLoss}% of portfolio).
      </p>
    </section>
  );
}
