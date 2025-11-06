// pages/pricing.tsx
import Head from "next/head";
import React, { useState } from "react";
import PricingTable from "@/components/PricingTable";
import PaymentModal from "@/components/PaymentModal";

const siteUrl = "https://seenweb-main.vercel.app";
const ogImage = `${siteUrl}/thumbnail.jpg`;

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const handleSelectPlan = (plan: string) => setSelectedPlan(plan);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex flex-col items-center py-12">
      <Head>
        <title>Bảng giá — SeenWeb</title>
        <meta
          name="description"
          content="Chọn gói ARCHIVE, MAGISTRATE hoặc TOÀN TRI để tăng tốc kênh YouTube của bạn với AI SeenWeb."
        />
        <link rel="canonical" href={`${siteUrl}/pricing`} />
        <meta property="og:title" content="Bảng giá — SeenWeb" />
        <meta property="og:description" content="Khám phá các gói nâng cấp của SeenWeb cho YouTuber." />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={`${siteUrl}/pricing`} />
      </Head>

      <h1 className="text-4xl font-bold mb-6 text-[#CDAD5A] text-center uppercase">
        Bảng Giá Gói SeenWeb
      </h1>

      <div className="w-11/12 max-w-6xl">
        <PricingTable setSelectedPlan={handleSelectPlan} />
      </div>

      {selectedPlan && (
        <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </div>
  );
}
