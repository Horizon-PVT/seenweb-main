// File: pages/_app.tsx (thay toàn bộ bằng cái này - FULL HOÀN CHỈNH)
import "@/styles/globals.css";  // Giữ nguyên import CSS của anh
import type { AppProps } from "next/app";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";  // Chỉ dùng NextAuth

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        {/* 🧠 SEO cơ bản áp dụng cho toàn site - giữ nguyên của anh */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Language" content="vi" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />

        {/* 🧭 Default OpenGraph */}
        <meta property="og:site_name" content="SeenWeb" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://seenweb-main.vercel.app/thumbnail.jpg"
        />

        {/* 🕊 Twitter card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://seenweb-main.vercel.app/thumbnail.jpg"
        />

        {/* 🧱 JSON-LD Schema (Logo + Website) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SeenWeb",
              url: "https://seenweb-main.vercel.app",
              logo: "https://seenweb-main.vercel.app/thumbnail.jpg",
            }),
          }}
        />
      </Head>

      <Component {...pageProps} />
    </SessionProvider>
  );
}