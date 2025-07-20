import React, { useState } from "react";
import PricingCard from "../components/pricingcard";

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const pricingPlans = [
    {
      name: "Free",
      price: "Rp0",
      features: [
        "Akses 1 course",
        "Tidak ada sertifikat",
        "Tidak bisa ikut quiz"
      ],
    },
    {
      name: "Pro",
      price: "Rp99.000 / bulan",
      features: [
        "Akses semua course",
        "Sertifikat kelulusan",
        "Bisa ikut quiz dan diskusi"
      ],
    },
    {
      name: "Premium",
      price: "Rp199.000 / bulan",
      features: [
        "Semua fitur Pro",
        "Akses konsultasi mentor",
        "Live class mingguan"
      ],
    },
  ];

  const handleSelect = (planName) => {
    setSelectedPlan(planName);
    alert(`Kamu memilih paket: ${planName}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pl-64 pt-24">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Pilih Paket Belajarmu</h1>
        <p className="text-gray-600">Tingkatkan kemampuanmu dengan paket belajar terbaik</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, idx) => (
          <PricingCard
            key={idx}
            plan={plan}
            isPopular={plan.name === "Pro"}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {selectedPlan && (
        <div className="mt-10 text-center text-green-700 font-medium">
          Kamu telah memilih paket <span className="font-bold">{selectedPlan}</span>
        </div>
      )}
    </div>
  );
}
