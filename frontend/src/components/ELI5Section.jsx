export default function ELI5Section({ eli5 }) {
  const cards = [
    { key: "diversification", title: "Diversification", field: "diversification" },
    { key: "biggestRisk", title: "Biggest risk", field: "biggestRisk" },
    { key: "goodNews", title: "What's working", field: "goodNews" },
  ];

  return (
    <section>
      <h2 className="text-sm font-medium text-white mb-4">Summary</h2>
      <div className="space-y-2">
        {cards.map((card) => (
          <div key={card.key} className="card p-4">
            <h3 className="text-xs font-medium text-[#5c5c63] mb-1">{card.title}</h3>
            <p className="text-sm text-[#a0a0a6] leading-relaxed">{eli5[card.field]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
