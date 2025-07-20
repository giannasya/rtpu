import React from "react";

export default function PricingCard({ plan, isPopular, onSelect }) {
  return (
    <div className={`border rounded-2xl p-6 shadow-md transition hover:scale-105 ${isPopular ? 'border-teal-700' : 'border-gray-300'}`}>
      {isPopular && (
        <div className="text-sm bg-teal-700 text-white px-3 py-1 rounded-full mb-4 inline-block">
          Paling Populer
        </div>
      )}
      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
      <p className="text-3xl font-semibold mb-4">{plan.price}</p>
      <ul className="mb-6 space-y-2 text-sm text-gray-700">
        {plan.features.map((feature, idx) => (
          <li key={idx}>✔️ {feature}</li>
        ))}
      </ul>
      <button
        onClick={() => onSelect(plan.name)}
        className="bg-teal-700 text-white w-full py-2 rounded-xl hover:bg-teal-800 transition"
      >
        Pilih Paket
      </button>
    </div>
  );
}
