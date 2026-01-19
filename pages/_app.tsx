import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "../components/ErrorBoundary";
import AttributionTracker from "@/components/AttributionTracker";
import WelcomePopupManager from "@/components/WelcomePopupManager";

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

  const title = "SeenYT - Công cụ AI YouTube thông minh nhất 2025";
  const description =
    "SeenYT - Tool AI hỗ trợ creator YouTube tạo video tự động, tìm micro niche, viết kịch bản, tối ưu SEO và tạo thumbnail AI.";

  return (
    <SessionProvider
      session={session}
      // giúp session cập nhật nhanh hơn sau login/redirect
      refetchOnWindowFocus={true}
      refetchInterval={30}
    >
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

        {/* JSON-LD */}
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
      </Head>

      <ErrorBoundary>
        <Component {...pageProps} />
        <AttributionTracker />
        <WelcomePopupManager />
      </ErrorBoundary>

      {/* THÊM DÒNG NÀY ĐỂ KÍCH HOẠT GTM TRÊN TOÀN BỘ TRANG */}
      <GoogleTagManager gtmId="GTM-PS4LS7FF" />
    </SessionProvider>
  );
}

export default appWithTranslation(App);
