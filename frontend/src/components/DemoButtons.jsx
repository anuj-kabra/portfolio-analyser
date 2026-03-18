import { DEMO_PORTFOLIOS } from "../data/demoPortfolios";

const cardStyles = {
  high: "border-red-200 bg-red-50 hover:bg-red-100",
  medium: "border-amber-200 bg-amber-50 hover:bg-amber-100",
  low: "border-green-200 bg-green-50 hover:bg-green-100",
};

const badgeStyles = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

export default function DemoButtons({ onDemo, disabled }) {
  return (
    <section>
      <p className="text-sm font-medium text-gray-500 mb-3">Try a demo portfolio</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(DEMO_PORTFOLIOS).map(([key, demo]) => (
          <button
            key={key}
            type="button"
            onClick={() => onDemo(key)}
            disabled={disabled}
            className={`text-left rounded-xl border p-4 transition-colors disabled:opacity-50 ${cardStyles[demo.riskLevel]}`}
          >
            <div className="font-semibold text-gray-900">{demo.label}</div>
            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${badgeStyles[demo.riskLevel]}`}>
              {demo.badge}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
