const INR = new Intl.NumberFormat("en-IN");

export default function SectorChart({ sectorExposure }) {
  const entries = Object.entries(sectorExposure).slice(0, 10);
  const maxWeight = entries[0]?.[1]?.weightPct || 1;

  return (
    <section>
      <h2 className="text-sm font-medium text-white mb-4">Sector exposure</h2>

      <div className="card p-4 space-y-3.5">
        {entries.map(([sector, data], index) => (
          <div key={sector}>
            <div className="flex justify-between items-baseline text-sm mb-1">
              <span className="text-[#ececed] text-xs">{sector}</span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#3a3a40]">₹{INR.format(data.rupeeAmount)}</span>
                <span className="text-xs font-medium text-[#a0a0a6] min-w-[3ch] text-right">{data.weightPct}%</span>
              </div>
            </div>
            <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-white/40"
                style={{
                  width: `${(data.weightPct / maxWeight) * 100}%`,
                  animation: `bar-fill 0.6s ease-out ${index * 0.05}s both`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
