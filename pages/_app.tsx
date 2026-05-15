import "@/styles/globals.css";
import "@/styles/custom-styles.css";
import "@/styles/responsive-failsafe.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { GoogleTagManager } from "@next/third-parties/google";
import { appWithTranslation } from "next-i18next";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "../components/ErrorBoundary";
import AttributionTracker from "@/components/AttributionTracker";
import { ThemeProvider } from "@/contexts/ThemeContext";
import MaintenancePage from "./maintenance";

const maintenanceMode = true;

function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.seenyt.net").replace(/\/$/, "");
  const ogImage = `${siteUrl}/thumbnail.jpg`;
  const title = "SeenYT - YouTube Content Operating System";
  const description =
    "SeenYT helps YouTube creators research niches, plan workflows, write scripts, produce content, optimize SEO, and improve channels with AI coaching.";

  return (
    <SessionProvider session={session} refetchOnWindowFocus={true} refetchInterval={300}>
      <ThemeProvider>
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta httpEquiv="Content-Language" content="vi" />
          <meta name="theme-color" content="#060B10" />

          <title>{title}</title>
          <meta name="description" content={description} />

          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

          <meta property="og:site_name" content="SeenYT" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={`${siteUrl}/`} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:secure_url" content={ogImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={ogImage} />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "SeenYT",
                url: `${siteUrl}/`,
                logo: ogImage,
              }),
            }}
          />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "SeenYT",
                url: `${siteUrl}/`,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                offers: {
                  "@type": "Offer",
                  price: "169000",
                  priceCurrency: "VND",
                  availability: "https://schema.org/InStock",
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.8",
                  ratingCount: "500",
                  bestRating: "5",
                  worstRating: "1",
                },
                description:
                  "AI-assisted content operating system for YouTube creators, connecting niche research, workflows, production, SEO, and coaching.",
                author: {
                  "@type": "Person",
                  name: "Tung Pham",
                },
                creator: {
                  "@type": "Organization",
                  name: "SeenYT",
                  url: `${siteUrl}/`,
                },
              }),
            }}
          />

        </Head>

        <ErrorBoundary>
          <main className="font-sans">
            {maintenanceMode ? <MaintenancePage /> : <Component {...pageProps} />}
          </main>
          {!maintenanceMode && <AttributionTracker />}
          {!maintenanceMode && <Toaster position="top-right" />}
        </ErrorBoundary>
      </ThemeProvider>

      <GoogleTagManager gtmId="GTM-PS4LS7FF" />
    </SessionProvider>
  );
}

export default appWithTranslation(App);
