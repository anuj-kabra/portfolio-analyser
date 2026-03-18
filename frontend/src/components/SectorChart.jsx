export default function SectorChart({ sectorExposure }) {
  const entries = Object.entries(sectorExposure).slice(0, 10);
  const maxWeight = entries[0]?.[1]?.weightPct || 1;

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">Sector exposure</h2>
      <div className="space-y-3">
        {entries.map(([sector, data]) => (
          <div key={sector}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{sector}</span>
              <span className="text-gray-600">{data.weightPct}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(data.weightPct / maxWeight) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
