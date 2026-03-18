import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const INR = new Intl.NumberFormat("en-IN");

export default function CrashReplay({ replays }) {
  const [selectedId, setSelectedId] = useState("");
  const selected = useMemo(() => {
    if (!replays?.length) return null;
    return replays.find((item) => item.event.id === selectedId) || replays[0];
  }, [replays, selectedId]);

  if (!replays?.length || !selected) return null;

  const chartData = selected.sectorLosses.slice(0, 10).map((loss) => ({
    sector: loss.sector,
    drawdownPct: Math.abs(loss.drawdownPct),
    lossRupees: loss.lossRupees,
  }));

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
        {selected.event.headline && (
          <div className="text-sm font-medium text-[#ececed] mt-1">{selected.event.headline}</div>
        )}
        {selected.event.description && (
          <p className="text-xs text-[#a0a0a6] mt-1">{selected.event.description}</p>
        )}
        <div className="text-xl text-red-400 font-semibold mt-2">-INR {INR.format(selected.totalLoss)}</div>
        <p className="text-xs text-[#a0a0a6] mt-1">
          Portfolio drops {selected.portfolioLossPct}% from INR {INR.format(selected.totalInvested)} to INR{" "}
          {INR.format(selected.surviving)}.
        </p>
      </div>

      <div className="card p-4">
        <div className="text-xs text-[#5c5c63] mb-3">Sector-wise loss by drawdown</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, "auto"]} tickFormatter={(v) => `${v}%`} stroke="#5c5c63" fontSize={10} />
              <YAxis type="category" dataKey="sector" width={100} stroke="#5c5c63" fontSize={10} tick={{ fill: "#a0a0a6" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                labelStyle={{ color: "#ececed" }}
                formatter={(value, name, props) => {
                  if (name === "drawdownPct") return [`${value.toFixed(1)}%`, "Drawdown"];
                  return [`INR ${INR.format(value)}`, "Loss"];
                }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="bg-[#1a1a1b] border border-white/10 rounded-lg px-3 py-2 text-xs">
                      <div className="text-[#ececed] font-medium">{d?.sector}</div>
                      <div className="text-red-300">Drawdown: {d?.drawdownPct?.toFixed(1)}%</div>
                      <div className="text-red-300">Loss: -INR {INR.format(d?.lossRupees || 0)}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="drawdownPct" radius={[0, 4, 4, 0]} fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-xs text-[#5c5c63]">
        Drawdowns sourced from NSE sectoral index historical data. Your loss is computed by applying each sector&apos;s
        drawdown to your portfolio&apos;s sector weight.
      </p>
    </section>
  );
}
