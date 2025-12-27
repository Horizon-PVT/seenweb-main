// File: pages/welcome.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

export default function Welcome() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // 1) Đợi session hydrate thật sự (tối đa 5 giây)
      const start = Date.now();
      let session = await getSession();

      while (!cancelled && !session && Date.now() - start < 5000) {
        await new Promise((r) => setTimeout(r, 200));
        session = await getSession();
      }

      // 2) Bắn event 1 lần / 1 phiên (để GTM bắt "Sự kiện tuỳ chỉnh")
      try {
        const key = "seenyt_sign_up_success_fired";
        const fired = sessionStorage.getItem(key);

        if (!fired) {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "sign_up_success", // tên custom event để GTM bắt
            method: "google",
            ts: Date.now(),
          });

          sessionStorage.setItem(key, "1");
        }
      } catch {
        // ignore
      }

      // 3) QUAN TRỌNG: về trang chủ khi session đã sẵn sàng
      if (!cancelled) {
        router.replace("/");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <div style={{ padding: 24 }}>Đang hoàn tất đăng nhập...</div>;
}
