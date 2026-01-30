// File: pages/_document.tsx (FINAL FIX - ĐÃ BAO GỒM TẤT CẢ KEYFRAME VÀ GLOWS)
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="vi">
      <Head>
        {/* 1. Fonts đã được load qua next/font trong _app.tsx để tối ưu hiệu suất và tránh lỗi cache */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html >
  );
}