import { useState } from "react";

const INR = new Intl.NumberFormat("en-IN");

export default function PortfolioInput({
  allFunds,
  portfolio,
  onPortfolioChange,
  onAnalyse,
  isAnalysing,
}) {
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  function addFund() {
    const fund = allFunds.find((item) => item.id === selectedId);
    const parsedAmount = Number(amount);

    if (!fund || !parsedAmount) {
      setMessage("Select a fund and enter an amount.");
      return;
    }
    if (portfolio.length >= 6) {
      setMessage("You can add up to 6 funds.");
      return;
    }
    if (portfolio.some((item) => item.fund.id === fund.id)) {
      setMessage("This fund is already in your portfolio.");
      return;
    }

    onPortfolioChange([...portfolio, { fund, amount: parsedAmount }]);
    setSelectedId("");
    setAmount("");
    setMessage("");
  }

  function removeFund(fundId) {
    onPortfolioChange(portfolio.filter((item) => item.fund.id !== fundId));
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-white">Build your portfolio</h2>
        <span className="text-xs text-[#5c5c63]">{portfolio.length}/6 funds</span>
      </div>

      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-[#5c5c63] mb-1.5">Fund</label>
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] text-[#ececed] px-3 py-2.5 text-sm focus:outline-none focus:border-white/20 transition-colors appearance-none"
            >
              <option value="" className="bg-[#141415]">Choose a mutual fund…</option>
              {allFunds.map((fund) => (
                <option key={fund.id} value={fund.id} className="bg-[#141415]">
                  {fund.name} ({fund.amc} · {fund.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#5c5c63] mb-1.5">Amount</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c5c63] text-sm">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] text-[#ececed] pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-white/20 transition-colors placeholder:text-[#3a3a40]"
                  placeholder="1,00,000"
                />
              </div>
              <button
                type="button"
                onClick={addFund}
                className="rounded-lg bg-white text-[#0a0a0b] text-sm font-medium px-4 py-2.5 hover:bg-white/90 active:bg-white/80 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {message ? (
          <p className="text-xs text-amber-400/80 mt-3">{message}</p>
        ) : null}
      </div>

      {/* Portfolio items */}
      {portfolio.length > 0 && (
        <div className="mt-3 space-y-1">
          {portfolio.map((entry, index) => (
            <div
              key={entry.fund.id}
              className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 flex items-center justify-between group hover:border-white/[0.08] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-[#3a3a40] w-4 shrink-0">{index + 1}</span>
                <div className="min-w-0">
                  <div className="text-sm text-[#ececed] truncate">{entry.fund.name}</div>
                  <div className="text-xs text-[#5c5c63]">₹{INR.format(entry.amount)}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFund(entry.fund.id)}
                className="text-xs text-[#5c5c63] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAnalyse}
        disabled={portfolio.length < 2 || isAnalysing}
        className="mt-5 w-full rounded-lg bg-white text-[#0a0a0b] px-5 py-3 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 active:bg-white/80 transition-colors flex items-center justify-center gap-2"
      >
        {isAnalysing ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-[#0a0a0b]/20 border-t-[#0a0a0b] rounded-full animate-spin" />
            Analysing…
          </>
        ) : (
          <>
            Analyse Portfolio
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </>
        )}
      </button>
    </section>
  );
}
