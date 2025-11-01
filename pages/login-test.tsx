// pages/login-test.tsx
import AuthPanel from "@/components/AuthPanel";

export default function LoginTest() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        SeenWeb – Đăng nhập & Đăng ký
      </h1>
      <AuthPanel />
    </main>
  );
}
