import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head"; // ✅ thêm để SEO & chặn index

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Lấy thông tin user khi vào trang
  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.isLoggedIn) router.push("/");
        else setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, [router]);

  // ✅ Hàm nâng cấp gói (gọi API upgrade)
  const handleUpgrade = async (plan: string) => {
    const res = await fetch("/api/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPlan: plan }),
    });

    const data = await res.json();
    if (data.success) {
      alert(`✅ ${data.message}`);
      window.location.reload(); // load lại để hiển thị gói mới
    } else {
      alert(`⚠️ ${data.error || "Không thể nâng cấp"}`);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-400">Đang tải...</p>;
  if (!user) return null;

  return (
    <>
      {/* ✅ SEO – chặn Google index trang nội bộ */}
      <Head>
        <title>Dashboard — SeenWeb</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-bold mb-4">Xin chào, {user.email}</h1>
        <p className="mb-6 text-gray-400">
          Gói hiện tại của bạn:{" "}
          <span className="font-semibold text-[#00BFFF]">{user.plan}</span>
        </p>

        {/* 🔹 Nút nâng cấp gói */}
        {user.plan === "EXPLORER" && (
          <div className="flex gap-3">
            <button
              onClick={() => handleUpgrade("ARCHIVE")}
              className="bg-[#00BFFF] text-black px-4 py-2 rounded-sm font-bold hover:bg-transparent hover:text-[#00BFFF] border-2 border-[#00BFFF] transition-all"
            >
              Nâng lên ARCHIVE
            </button>
            <button
              onClick={() => handleUpgrade("MAGISTRATE")}
              className="bg-[#CDAD5A] text-black px-4 py-2 rounded-sm font-bold hover:bg-transparent hover:text-[#CDAD5A] border-2 border-[#CDAD5A] transition-all"
            >
              Lên MAGISTRATE
            </button>
          </div>
        )}

        {user.plan === "MAGISTRATE" && (
          <button
            onClick={() => handleUpgrade("TOANTRI")}
            className="bg-[#CDAD5A] text-black px-4 py-2 rounded-sm font-bold hover:bg-transparent hover:text-[#CDAD5A] border-2 border-[#CDAD5A] transition-all"
          >
            Lên TOÀN TRI
          </button>
        )}

        <button
          onClick={async () => {
            await fetch("/api/logout", { method: "POST" });
            router.push("/");
          }}
          className="mt-6 px-4 py-2 border border-gray-600 text-gray-400 rounded hover:text-white hover:border-[#00BFFF] transition-all"
        >
          Đăng xuất
        </button>
      </div>
    </>
  );
}
