export default function ELI5Section({ eli5 }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">ELI5 summary</h2>
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Diversification reality</h3>
          <p className="text-sm text-gray-800">{eli5.diversification}</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Biggest hidden risk</h3>
          <p className="text-sm text-gray-800">{eli5.biggestRisk}</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">What is working</h3>
          <p className="text-sm text-gray-800">{eli5.goodNews}</p>
        </div>
      </div>
    </section>
  );
}
