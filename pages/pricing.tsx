import Head from "next/head";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingTable from "@/components/PricingTable";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://seenyt.net").replace(/\/$/, "");
const ogImage = `${siteUrl}/thumbnail.jpg`;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#05080d] text-white">
      <Head>
        <title>Pricing - SeenYT YouTube Content OS</title>
        <meta
          name="description"
          content="Choose a SeenYT plan for niche research, content workflows, video production, YouTube SEO, and AI Creator Coach."
        />
        <link rel="canonical" href={`${siteUrl}/pricing`} />
        <meta property="og:title" content="SeenYT Pricing" />
        <meta property="og:description" content="Simple plans for YouTube creators and teams running repeatable content workflows." />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={`${siteUrl}/pricing`} />
      </Head>

      <Header />

      <main className="pt-24">
        <section className="border-b border-white/10 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-200">
              Workflow pricing
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl">
              Trả tiền cho quy trình làm kênh, không phải một đống tool rời rạc
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-400">
              SeenYT gom nghiên cứu ngách, phân tích đối thủ, viết kịch bản, sản xuất video, SEO và AI Coach vào các gói dễ chọn cho creator YouTube.
            </p>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <PricingTable />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "vi", ["common"])),
  },
});
