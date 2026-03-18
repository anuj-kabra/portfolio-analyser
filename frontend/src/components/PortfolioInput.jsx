import { useMemo, useState } from "react";

const INR = new Intl.NumberFormat("en-IN");

export default function PortfolioInput({
  allFunds,
  portfolio,
  onPortfolioChange,
  onAnalyse,
  isAnalysing,
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const filteredFunds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allFunds;
    return allFunds.filter((fund) => fund.name.toLowerCase().includes(q));
  }, [allFunds, query]);

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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Build your portfolio</h2>

      <div className="rounded-xl border border-gray-200 p-4 bg-white">
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Search fund name"
          />

          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Select fund</option>
            {filteredFunds.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.name} ({fund.amc} · {fund.category})
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Amount (INR)"
            />
            <button
              type="button"
              onClick={addFund}
              className="rounded-lg bg-gray-900 text-white text-sm px-4 py-2 hover:bg-black"
            >
              Add
            </button>
          </div>
        </div>

        {message ? <p className="text-xs text-amber-700 mt-3">{message}</p> : null}
      </div>

      <div className="mt-4 space-y-2">
        {portfolio.map((entry) => (
          <div
            key={entry.fund.id}
            className="rounded-lg border border-gray-200 px-3 py-2 flex items-center justify-between text-sm"
          >
            <div>
              <div className="font-medium text-gray-900">{entry.fund.name}</div>
              <div className="text-xs text-gray-500">INR {INR.format(entry.amount)}</div>
            </div>
            <button
              type="button"
              onClick={() => removeFund(entry.fund.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAnalyse}
        disabled={portfolio.length < 2 || isAnalysing}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium disabled:opacity-50"
      >
        {isAnalysing ? "Analysing..." : "Analyse"}
      </button>
    </section>
  );
}
