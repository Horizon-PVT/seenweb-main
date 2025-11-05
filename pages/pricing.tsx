// pages/pricing.tsx
import React, { useState } from "react";
import PricingTable from "@/components/PricingTable";
import PaymentModal from "@/components/PaymentModal";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (plan: string) => {
    console.log("Selected plan:", plan);
    setSelectedPlan(plan);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex flex-col items-center py-12">
      <h1 className="text-4xl font-bold mb-6 text-[#CDAD5A] text-center uppercase">
        Bảng Giá Gói SeenWeb
      </h1>

      {/* ✅ Gọi component bảng giá và truyền hàm đúng cách */}
      <div className="w-11/12 max-w-6xl">
        <PricingTable setSelectedPlan={handleSelectPlan} />
      </div>

      {/* ✅ Popup QR khi click chọn gói */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}
