import "@/styles/globals.css";
import "@/styles/custom-styles.css"; // Import styles tùy chỉnh toàn cục
import "@/styles/responsive-failsafe.css"; // GLOBAL fix: ensures Tailwind responsive classes work on ALL machines
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "../components/ErrorBoundary";
import AttributionTracker from "@/components/AttributionTracker";
import WelcomePopupManager from "@/components/WelcomePopupManager";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from "@/contexts/ThemeContext";

// Removed next/font/google to prevent ENOTFOUND build errors
// Configuration is now handled via standard <link> tags in <Head> and CSS variables in styles/globals.css


// THÊM DÒNG NÀY ĐỂ DÙNG GTM CHÍNH THỨC
import { GoogleTagManager } from '@next/third-parties/google';

import { appWithTranslation } from 'next-i18next';

function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  // Domain chuẩn cho share (URL tuyệt đối)
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.seenyt.net").replace(/\/$/, "");

  // GIỮ ẢNH CŨ (đúng cái ảnh đang hiện khi share)
  const ogImage = `${siteUrl}/thumbnail.jpg`;

  const title = "SeenYT - Công cụ AI YouTube thông minh nhất 2026";
  const description =
    "SeenYT - Tool AI hỗ trợ creator YouTube tạo video tự động, tìm micro niche, viết kịch bản, tối ưu SEO và tạo thumbnail AI.";

  return (
    <SessionProvider
      session={session}
      // giúp session cập nhật nhanh hơn sau login/redirect
      refetchOnWindowFocus={true}
      refetchInterval={300}
    >
      <ThemeProvider>
        <Head>
        {/* BASIC */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Language" content="vi" />
        <meta name="theme-color" content="#0A0F1E" />

        {/* TITLE + DESCRIPTION */}
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* ICONS */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* OPEN GRAPH (Zalo/Facebook) */}
        <meta property="og:site_name" content="SeenYT" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:secure_url" content={ogImage} />

        {/* (khuyên có) width/height để Zalo ổn định hơn */}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* TWITTER */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD: Organization */}
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

        {/* JSON-LD: SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "SeenYT",
              url: `${siteUrl}/`,
              applicationCategory: "MultimediaApplication",
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
                "AI-powered YouTube studio for faceless content creation. 15+ tools for script writing, AI voice, virtual MC, and SEO.",
              author: {
                "@type": "Person",
                name: "Tùng Phạm",
              },
              creator: {
                "@type": "Organization",
                name: "SeenYT",
                url: `${siteUrl}/`,
              },
            }),
          }}
        />

        {/* GOOGLE FONTS (Standard Links to avoid build-time fetch errors) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <ErrorBoundary>
        <main className="font-sans">
          <Component {...pageProps} />
        </main>
        <AttributionTracker />
        <WelcomePopupManager />
        <Toaster position="top-right" />
      </ErrorBoundary>
      </ThemeProvider>

      {/* THÊM DÒNG NÀY ĐỂ KÍCH HOẠT GTM TRÊN TOÀN BỘ TRANG */}
      <GoogleTagManager gtmId="GTM-PS4LS7FF" />
    </SessionProvider>
  );
}

export default appWithTranslation(App);
