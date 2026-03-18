function overlapTone(overlapPct) {
  if (overlapPct <= 20) {
    return "bg-green-50 border-green-200 text-green-800";
  }
  if (overlapPct <= 40) {
    return "bg-amber-50 border-amber-200 text-amber-800";
  }
  return "bg-red-50 border-red-200 text-red-800";
}

export default function OverlapMatrix({ overlap }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Your funds share {overlap.averageOverlapPct}% of the same stocks on average
      </h2>
      <p className="text-sm text-gray-500 mb-4">Green: low overlap · Amber: moderate · Red: high</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {overlap.pairs.map((pair) => (
          <div key={`${pair.idA}-${pair.idB}`} className={`rounded-xl border p-4 ${overlapTone(pair.overlapPct)}`}>
            <div className="text-sm font-medium">
              {pair.fundA} <span className="text-gray-500">vs</span> {pair.fundB}
            </div>
            <div className="text-2xl font-semibold mt-2">{pair.overlapPct}%</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Top shared stocks</h3>
        {overlap.topSharedStocks.length === 0 ? (
          <p className="text-sm text-gray-500">No shared stocks found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-3 py-2">Stock</th>
                  <th className="text-left px-3 py-2">Ticker</th>
                  <th className="text-left px-3 py-2">Sector</th>
                  <th className="text-left px-3 py-2">Funds</th>
                  <th className="text-right px-3 py-2">Combined Weight</th>
                </tr>
              </thead>
              <tbody>
                {overlap.topSharedStocks.map((stock) => (
                  <tr key={stock.ticker} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-800">{stock.name}</td>
                    <td className="px-3 py-2 text-gray-600">{stock.ticker}</td>
                    <td className="px-3 py-2 text-gray-600">{stock.sector}</td>
                    <td className="px-3 py-2 text-gray-600">{stock.funds.join(", ")}</td>
                    <td className="px-3 py-2 text-right text-gray-800">{stock.combinedWeight}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
