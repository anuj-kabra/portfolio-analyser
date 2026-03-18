const CARD_STYLES = {
  concentrated: "border-l-4 border-amber-400 bg-amber-50",
  redundant: "border-l-4 border-red-400 bg-red-50",
  recommendation: "border-l-4 border-green-400 bg-green-50",
};

const LABELS = {
  concentrated: "What's concentrated",
  redundant: "What's redundant",
  recommendation: "What to change",
};

export default function AIInsights({ insights, loading, error }) {
  if (loading) {
    return (
      <section className="rounded-xl border border-gray-200 p-5 text-center">
        <div className="animate-spin inline-block h-5 w-5 border-2 border-gray-300 border-t-blue-500 rounded-full" />
        <p className="mt-2 text-sm text-gray-600">Asking our AI analyst...</p>
      </section>
    );
  }

  if (error || !insights) {
    return (
      <section className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
        AI insights are unavailable right now, but the overlap and risk analysis above is still valid.
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">AI insights</h2>
      <div className="space-y-3">
        {Object.keys(CARD_STYLES).map((key) => (
          <div key={key} className={`rounded-xl p-4 ${CARD_STYLES[key]}`}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
              {LABELS[key]}
            </h3>
            <p className="text-sm text-gray-800">{insights[key]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
