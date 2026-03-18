import { DEMO_PORTFOLIOS } from "../data/demoPortfolios";

const borderColor = {
  high: "border-red-500/30",
  medium: "border-amber-500/30",
  low: "border-emerald-500/30",
};

const badgeStyles = {
  high: "text-red-400 bg-red-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  low: "text-emerald-400 bg-emerald-500/10",
};

export default function DemoButtons({ onDemo, disabled }) {
  return (
    <section>
      <p className="text-xs text-[#5c5c63] mb-3">Try a demo portfolio</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {Object.entries(DEMO_PORTFOLIOS).map(([key, demo]) => (
          <button
            key={key}
            type="button"
            onClick={() => onDemo(key)}
            disabled={disabled}
            className={`text-left card p-4 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors ${borderColor[demo.riskLevel]}`}
          >
            <div className="text-sm font-medium text-white mb-2">{demo.label}</div>
            <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${badgeStyles[demo.riskLevel]}`}>
              {demo.badge}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
