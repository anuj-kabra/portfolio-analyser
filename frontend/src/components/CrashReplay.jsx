import { useMemo, useState } from "react";

const INR = new Intl.NumberFormat("en-IN");

export default function CrashReplay({ replays }) {
  const [selectedId, setSelectedId] = useState("");
  const selected = useMemo(() => {
    if (!replays?.length) return null;
    return replays.find((item) => item.event.id === selectedId) || replays[0];
  }, [replays, selectedId]);

  if (!replays?.length || !selected) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-white">Historical Crash Replay</h2>

      <div className="flex flex-wrap gap-2">
        {replays.map((replay) => (
          <button
            key={replay.event.id}
            type="button"
            onClick={() => setSelectedId(replay.event.id)}
            className={`text-xs px-3 py-1.5 rounded-lg border ${
              selected.event.id === replay.event.id
                ? "border-red-400/40 bg-red-500/[0.15] text-red-300"
                : "border-white/[0.08] bg-white/[0.03] text-[#a0a0a6]"
            }`}
          >
            {replay.event.name}
          </button>
        ))}
      </div>

      <div className="card p-5">
        <div className="text-xs text-[#5c5c63]">{selected.event.date}</div>
        <div className="text-xl text-red-400 font-semibold mt-1">-INR {INR.format(selected.totalLoss)}</div>
        <p className="text-xs text-[#a0a0a6] mt-1">
          Portfolio drops {selected.portfolioLossPct}% from INR {INR.format(selected.totalInvested)} to INR{" "}
          {INR.format(selected.surviving)}.
        </p>
      </div>

      <div className="card p-4 space-y-2">
        {selected.sectorLosses.slice(0, 8).map((loss) => (
          <div key={loss.sector} className="flex items-center text-xs">
            <span className="w-28 text-[#a0a0a6] truncate">{loss.sector}</span>
            <div className="flex-1 mx-2 h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full bg-red-400" style={{ width: `${Math.min(Math.abs(loss.drawdownPct), 80)}%` }} />
            </div>
            <span className="w-20 text-right text-red-300">-INR {INR.format(loss.lossRupees)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
