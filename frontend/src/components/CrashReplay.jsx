import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const INR = new Intl.NumberFormat("en-IN");

function shortName(name) {
  return String(name || "").split(" Fund")[0];
}

function RecoveryBar({ months, maxMonths }) {
  const pct = maxMonths > 0 ? Math.min((months / maxMonths) * 100, 100) : 0;
  const color = months <= 12 ? "bg-emerald-500" : months <= 24 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="h-1.5 rounded-full bg-white/[0.05] flex-1">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

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

  const vsNifty = selected.vsNifty;
  const recoveryTimeline = selected.recoveryTimeline || [];
  const maxRecovery = recoveryTimeline.reduce((m, r) => Math.max(m, r.recoveryMonths), 0);
  const perFundLoss = selected.perFundLoss || [];

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

        {/* Portfolio vs Nifty */}
        {vsNifty && (
          <div className={`mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-3 text-xs`}>
            <span className="text-[#5c5c63]">vs Nifty 50:</span>
            <span className="text-[#a0a0a6]">Nifty fell {vsNifty.niftyLossPct}%</span>
            <span className={vsNifty.betterThanNifty ? "text-emerald-400" : "text-amber-400"}>
              {vsNifty.betterThanNifty
                ? `You beat Nifty by ${Math.abs(vsNifty.diff)}%`
                : `You underperformed by ${vsNifty.diff}%`}
            </span>
          </div>
        )}
      </div>

      {/* Per-fund loss cards */}
      {perFundLoss.length > 0 && (
        <div>
          <div className="text-xs text-[#5c5c63] mb-2">Estimated loss per fund</div>
          <div className="grid sm:grid-cols-2 gap-2">
            {perFundLoss.map((f) => (
              <div key={f.name} className="card p-3">
                <div className="text-xs text-[#ececed] mb-1">{shortName(f.name)}</div>
                <div className="flex items-baseline justify-between">
                  <span className="text-base text-red-400 font-medium">-INR {INR.format(f.lossRupees)}</span>
                  <span className="text-[11px] text-[#5c5c63]">{f.lossPct}% loss</span>
                </div>
                <div className="text-[11px] text-[#5c5c63] mt-0.5">
                  Surviving: INR {INR.format(f.surviving)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="text-xs text-[#5c5c63] mb-3">Sector-wise loss by drawdown</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, "auto"]} tickFormatter={(v) => `${v}%`} stroke="#5c5c63" fontSize={10} />
              <YAxis type="category" dataKey="sector" width={100} stroke="#5c5c63" fontSize={10} tick={{ fill: "#a0a0a6" }} />
              <Tooltip
                cursor={false}
                contentStyle={{ backgroundColor: "#1a1a1b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                labelStyle={{ color: "#ececed" }}
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
              <Bar dataKey="drawdownPct" radius={[0, 4, 4, 0]} fill="#f87171" activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recovery Timeline */}
      {recoveryTimeline.length > 0 && (
        <div className="card p-4">
          <div className="text-xs text-[#5c5c63] mb-3">Estimated recovery timeline</div>
          <div className="space-y-2">
            {recoveryTimeline.slice(0, 8).map((r) => (
              <div key={r.sector} className="flex items-center gap-3">
                <span className="text-[11px] text-[#a0a0a6] w-28 shrink-0">{r.sector}</span>
                <RecoveryBar months={r.recoveryMonths} maxMonths={maxRecovery} />
                <span className={`text-[11px] w-16 text-right shrink-0 ${
                  r.recoveryMonths <= 12 ? "text-emerald-400" : r.recoveryMonths <= 24 ? "text-amber-400" : "text-red-400"
                }`}>
                  {r.recoveryMonths} mo
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#5c5c63] mt-3">
            Recovery = months for sectoral index to return to pre-crash highs.
          </p>
        </div>
      )}

      <p className="text-xs text-[#5c5c63]">
        Drawdowns sourced from NSE sectoral index historical data. Your loss is computed by applying each sector&apos;s
        drawdown to your portfolio&apos;s sector weight.
      </p>
    </section>
  );
}
