// File: pages/new-youtuber.tsx
import Head from "next/head";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

type QuizChoice = "newbie" | "stuck" | "optimize" | null;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function secondsUntilEndOfDayBangkok(now = new Date()) {
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const bkkNow = new Date(utc + 7 * 60 * 60_000);

  const end = new Date(bkkNow);
  end.setHours(23, 59, 59, 999);

  const diffMs = end.getTime() - bkkNow.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
}

function useCountdownToEndOfDayBangkok(active: boolean) {
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    if (!active) return;
    setSeconds(secondsUntilEndOfDayBangkok());
    const t = setInterval(() => setSeconds(secondsUntilEndOfDayBangkok()), 1000);
    return () => clearInterval(t);
  }, [active]);

  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = seconds % 60;

  return { seconds, hh, mm, ss };
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Icon({
  name,
  className,
}: {
  name:
  | "spark"
  | "bolt"
  | "shield"
  | "chart"
  | "clock"
  | "wand"
  | "check"
  | "arrow";
  className?: string;
}) {
  const common = { className: className ?? "h-5 w-5" };
  switch (name) {
    case "spark":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l1.2 5.2L18 8l-4.8 1.1L12 14l-1.2-4.9L6 8l4.8-.8L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M19 13l.7 3.1L23 17l-3.3.7L19 21l-.7-3.3L15 17l3.3-.9L19 13Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path
            d="M13 2L3 14h7l-1 8 10-12h-7l1-8Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2 20 6v7c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-4Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M9 12l2 2 4-5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M4 19V5" stroke="currentColor" strokeWidth="2" />
          <path d="M4 19h16" stroke="currentColor" strokeWidth="2" />
          <path d="M8 15v-5" stroke="currentColor" strokeWidth="2" />
          <path d="M12 15V7" stroke="currentColor" strokeWidth="2" />
          <path d="M16 15v-3" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "wand":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M3 21 14 10" stroke="currentColor" strokeWidth="2" />
          <path d="M14 10l7-7" stroke="currentColor" strokeWidth="2" />
          <path d="M14 10l-3-3" stroke="currentColor" strokeWidth="2" />
          <path
            d="M18 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "check":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="none">
          <path d="M5 12h12" stroke="currentColor" strokeWidth="2" />
          <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

function ToolShot({ src, alt, badge }: { src: string; alt: string; badge: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
      <div className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-black text-white/80 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00ffb4]" />
        {badge}
      </div>

      <div className="relative aspect-[16/10] w-full">
        {!failed ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover opacity-95 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
            onError={() => setFailed(true)}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(1200px_400px_at_20%_0%,rgba(0,255,180,0.18),transparent_55%),radial-gradient(1000px_380px_at_85%_20%,rgba(255,96,203,0.16),transparent_55%),radial-gradient(900px_380px_at_55%_100%,rgba(122,92,255,0.16),transparent_55%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
            <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="relative flex h-full items-center justify-center px-6 text-center">
              <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-xs font-black text-white/70 backdrop-blur">
                Tool Preview
              </div>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/12 to-transparent opacity-95" />
      </div>
    </div>
  );
}

function VideoShot({ videoId, badge }: { videoId: string; badge: string }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
      <div className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-black text-white/80 backdrop-blur pointer-events-none">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00ffb4]" />
        {badge}
      </div>

      <div className="relative aspect-video w-full">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={badge}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export default function NewYoutuberLanding() {
  const router = useRouter();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  // Fix hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const choosePathRef = useRef<HTMLDivElement | null>(null);

  // Video demo (thay ID nếu muốn)
  const videoId = "XpopyNZKYKw";

  // Tool URLs
  const TOOL_MICRO = "/?tool=micro-niche-miner";
  const TOOL_SCRIPT = "/?tool=scriptwriter";
  const TOOL_SEO = "/?tool=seo";

  // Scarcity config
  const SHOW_SLOTS = true;
  const TOTAL_SLOTS = 20;

  // SSR-safe value
  const [slotsLeft, setSlotsLeft] = useState<number>(TOTAL_SLOTS);

  useEffect(() => {
    if (!mounted) return;
    try {
      const key = "seenyt_trial_slots_left_v4";
      const cached = window.localStorage.getItem(key);
      const n = cached ? Number(cached) : NaN;
      const val = Number.isFinite(n) ? Math.max(1, Math.min(TOTAL_SLOTS, n)) : TOTAL_SLOTS;
      setSlotsLeft(val);
    } catch {
      setSlotsLeft(TOTAL_SLOTS);
    }
  }, [mounted, TOTAL_SLOTS]);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem("seenyt_trial_slots_left_v4", String(slotsLeft));
    } catch { }
  }, [mounted, slotsLeft]);

  const cd = useCountdownToEndOfDayBangkok(mounted);

  // Funnel choice
  const [choice, setChoice] = useState<QuizChoice>(null);

  const primaryCta = useMemo(() => {
    if (choice === "newbie") return { label: "Bắt đầu: Micro Niche", path: TOOL_MICRO };
    if (choice === "stuck") return { label: "Vào ngay: Scriptwriter", path: TOOL_SCRIPT };
    if (choice === "optimize") return { label: "Tối ưu: SEO YouTube", path: TOOL_SEO };
    return { label: "Dùng thử miễn phí (Login Google)", path: TOOL_MICRO };
  }, [choice]);

  const goTo = async (path: string) => {
    if (isLoggedIn) {
      await router.push(path);
      return;
    }
    await signIn("google", { callbackUrl: path });
  };

  const timeText = useMemo(() => {
    if (!mounted) return "--:--:--";
    return `${pad2(cd.hh)}:${pad2(cd.mm)}:${pad2(cd.ss)}`;
  }, [mounted, cd.hh, cd.mm, cd.ss]);

  const urgencyText = useMemo(() => {
    if (!mounted) return "WELCOME OFFER · Đang tải ưu đãi...";
    if (SHOW_SLOTS) return `WELCOME OFFER · Còn ${slotsLeft}/${TOTAL_SLOTS} suất · Hết sau ${timeText}`;
    return `WELCOME OFFER · Hết sau ${timeText}`;
  }, [mounted, SHOW_SLOTS, slotsLeft, TOTAL_SLOTS, timeText]);

  // highlight effect when clicking offer
  const [highlight, setHighlight] = useState(false);
  const jumpToChoosePath = () => {
    choosePathRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlight(true);
    window.setTimeout(() => setHighlight(false), 1200);
  };

  return (
    <>
      <Head>
        <title>SeenYT | Premium funnel 3 bước cho người mới làm YouTube</title>
        <meta
          name="description"
          content="SeenYT dẫn bạn theo 3 bước: Micro Niche → Viết kịch bản → SEO YouTube. Login Google là dùng ngay, không cần thẻ."
        />
      </Head>

      <main className="min-h-screen text-white">
        {/* Custom keyframes (inline, no tailwind config needed) */}
        <style>{`
          @keyframes shine { 
            0% { transform: translateX(-120%) rotate(12deg); opacity: 0; }
            20% { opacity: .35; }
            50% { opacity: .2; }
            100% { transform: translateX(140%) rotate(12deg); opacity: 0; }
          }
          @keyframes nudge {
            0%, 100% { transform: translateY(0); }
            25% { transform: translateY(-2px); }
            50% { transform: translateY(1px); }
            75% { transform: translateY(-1px); }
          }
        `}</style>

        {/* Cinematic dark + neon */}
        <div className="fixed inset-0 -z-10 bg-[#05060a]" />
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_20%,rgba(255,255,255,0.06),transparent_65%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_80%_40%,rgba(0,255,180,0.10),transparent_65%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(700px_500px_at_18%_35%,rgba(255,96,203,0.09),transparent_62%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(800px_540px_at_30%_90%,rgba(122,92,255,0.09),transparent_65%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.12),rgba(0,0,0,0.80))]" />
        </div>

        {/* Top Offer Bar: wider container */}
        <div className="sticky top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-6 py-3 md:px-10 lg:px-14">
            <button
              onClick={jumpToChoosePath}
              className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-left text-xs font-black text-white/90 shadow-[0_18px_70px_rgba(0,0,0,0.55)]"
              aria-label="WELCOME OFFER"
              title="Click để chọn path và vào tool"
            >
              <span className="mr-2 inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ffb4] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00ffb4]" />
                </span>
                <span className="bg-gradient-to-r from-[#00ffb4] via-[#ff70d6] to-[#7a5cff] bg-clip-text text-transparent">
                  {urgencyText}
                </span>
              </span>

              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.35) 20%, transparent 45%)",
                  width: "40%",
                  height: "200%",
                  top: "-50%",
                  left: "-40%",
                  animation: "shine 2.8s ease-in-out infinite",
                }}
              />
            </button>

            <button
              onClick={() => goTo(primaryCta.path)}
              className="rounded-2xl bg-gradient-to-r from-[#00ffb4] via-[#ff70d6] to-[#7a5cff] px-4 py-2 text-xs font-black text-black transition hover:brightness-110"
              style={{ animation: mounted ? "nudge 1.4s ease-in-out infinite" : undefined }}
            >
              {isLoggedIn ? "Vào tool ngay" : "Login Google"}
            </button>
          </div>
        </div>

        {/* HERO: full width + full-viewport feel */}
        <section className="w-full px-6 pb-12 pt-10 md:px-10 md:pb-16 md:pt-16 lg:px-14">
          <div className="mx-auto max-w-[1400px]">
            <div className="relative grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:gap-14">
              {/* Neon rim light (right) */}
              <div className="pointer-events-none absolute right-[-140px] top-[40px] hidden h-[560px] w-[280px] rotate-[10deg] bg-[radial-gradient(closest-side,rgba(0,255,180,0.55),transparent_72%)] blur-2xl opacity-70 md:block" />

              {/* Left */}
              <div className="max-w-[680px]">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/80 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-[#00ffb4]" />
                  Premium flow cho người mới: chọn đúng vấn đề → vào đúng tool
                </div>

                <h1 className="mt-6 text-[42px] font-black leading-[1.12] tracking-[-0.02em] md:text-[64px] md:leading-[1.08] lg:text-[72px]">
                  Làm YouTube Không Lên View?

                  <span className="mt-4 block">
                    Người Mới —{" "}
                    <span className="bg-gradient-to-r from-[#00ffb4] via-[#ff70d6] to-[#7a5cff] bg-clip-text text-transparent">
                      Thường Chết Ở 1 Trong 3 Bước Này
                    </span>{" "}
                    .
                  </span>
                </h1>

                <p className="mt-6 max-w-[640px] text-base leading-7 text-white/70 md:text-lg md:leading-8">
                  Người mới thường sai ở: chọn ngách – viết script – tối ưu SEO.
                  SeenYT gom 3 bước này thành 1 path, làm đúng từ đầu.

                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={jumpToChoosePath}
                    className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-black text-white/90 backdrop-blur transition hover:bg-white/10"
                  >
                    Chọn path (bắt đầu đúng)
                  </button>

                  <button
                    onClick={() => goTo(primaryCta.path)}
                    className="rounded-2xl bg-gradient-to-r from-[#00ffb4] via-[#ff70d6] to-[#7a5cff] px-6 py-4 text-sm font-black text-black shadow-[0_18px_70px_rgba(0,255,180,0.10)] transition hover:brightness-110"
                  >
                    {isLoggedIn ? primaryCta.label : "Dùng thử miễn phí (Login Google)"}
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/65">
                  <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">Không cần thẻ</span>
                  <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">Login Google 1 chạm</span>
                  <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">Đi thẳng vào tool</span>
                </div>

                {/* Choose your path (highlight target) */}
                <div
                  ref={choosePathRef}
                  className={classNames(
                    "mt-10 rounded-3xl border bg-white/[0.04] p-5 shadow-[0_22px_90px_rgba(0,0,0,0.60)] backdrop-blur transition",
                    highlight ? "border-[#00ffb4]/60 ring-2 ring-[#00ffb4]/30" : "border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-black">Choose your path</div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-white/70">
                      <Icon name="wand" className="h-4 w-4" />
                      Smart routing
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <button
                      onClick={() => setChoice("newbie")}
                      className={classNames(
                        "rounded-2xl border p-4 text-left transition",
                        choice === "newbie"
                          ? "border-[#00ffb4]/45 bg-[#00ffb4]/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl border border-white/10 bg-black/25 p-2 text-[#00ffb4]">
                          <Icon name="spark" />
                        </div>
                        <div>
                          <div className="text-sm font-black">Chọn ngách đúng</div>
                          <div className="mt-1 text-xs text-white/60">Ra 10 niche khả thi, tránh ngách “toang”</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setChoice("stuck")}
                      className={classNames(
                        "rounded-2xl border p-4 text-left transition",
                        choice === "stuck"
                          ? "border-[#ff70d6]/45 bg-[#ff70d6]/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl border border-white/10 bg-black/25 p-2 text-[#ff70d6]">
                          <Icon name="bolt" />
                        </div>
                        <div>
                          <div className="text-sm font-black">Ra kịch bản nhanh</div>
                          <div className="mt-1 text-xs text-white/60">Hook → outline → CTA, nói là quay được</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setChoice("optimize")}
                      className={classNames(
                        "rounded-2xl border p-4 text-left transition",
                        choice === "optimize"
                          ? "border-[#7a5cff]/45 bg-[#7a5cff]/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl border border-white/10 bg-black/25 p-2 text-[#7a5cff]">
                          <Icon name="chart" />
                        </div>
                        <div>
                          <div className="text-sm font-black">Tối ưu để lên đề xuất</div>
                          <div className="mt-1 text-xs text-white/60">Title/desc/tags theo intent, tăng CTR</div>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-white/60">
                      {mounted && SHOW_SLOTS ? `Còn ${slotsLeft}/${TOTAL_SLOTS} suất · Hết sau ${timeText}` : " "}
                    </div>

                    <button
                      onClick={() => goTo(primaryCta.path)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00ffb4] via-[#ff70d6] to-[#7a5cff] px-5 py-3 text-sm font-black text-black transition hover:brightness-110"
                    >
                      {isLoggedIn ? primaryCta.label : "Dùng thử miễn phí (Login Google)"}
                      <Icon name="arrow" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: 3D mockup */}
              <div className="relative">
                <div className="pointer-events-none absolute -bottom-12 left-1/2 h-28 w-[115%] -translate-x-1/2 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.10),rgba(255,255,255,0.02),transparent_70%)] blur-sm" />

                <div className="relative mx-auto max-w-[620px]">
                  <div
                    className="relative rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_45px_140px_rgba(0,0,0,0.65)]
                    [transform:perspective(1100px)_rotateX(12deg)_rotateY(-18deg)_rotateZ(2deg)]
                    transition duration-500 hover:[transform:perspective(1100px)_rotateX(8deg)_rotateY(-10deg)_rotateZ(1deg)]"
                  >
                    <div className="pointer-events-none absolute -right-7 top-10 h-80 w-20 bg-[radial-gradient(closest-side,rgba(0,255,180,0.70),transparent_70%)] blur-2xl opacity-85" />

                    <div className="overflow-hidden rounded-2xl border border-white/10">
                      <div className="relative aspect-video w-full">
                        <Image
                          src="/landing/micro-niche.png"
                          alt="SeenYT preview"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        { t: "10 niches", s: "generated", c: "text-[#00ffb4]" },
                        { t: "1 script", s: "structured", c: "text-[#ff70d6]" },
                        { t: "SEO pack", s: "optimized", c: "text-[#7a5cff]" },
                      ].map((x) => (
                        <div key={x.t} className="rounded-2xl border border-white/10 bg-black/25 p-3 text-center">
                          <div className={classNames("text-xs font-black", x.c)}>{x.t}</div>
                          <div className="mt-1 text-[11px] text-white/55">{x.s}</div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => goTo(primaryCta.path)}
                      className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#00ffb4] via-[#ff70d6] to-[#7a5cff] px-6 py-4 text-sm font-black text-black transition hover:brightness-110"
                    >
                      {isLoggedIn ? "Vào tool theo path đã chọn" : "Login Google để dùng thử"}
                    </button>

                    <div className="mt-3 text-center text-[11px] text-white/55">
                      {mounted ? `Offer reset cuối ngày · Hết sau ${timeText}` : " "}
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-white/70">Demo nhanh</div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black text-white/70">
                      SeenYT Flow
                    </div>
                  </div>

                  <div className="mt-3 overflow-hidden rounded-3xl border border-white/10">
                    <div className="relative aspect-video w-full">
                      <iframe
                        className="absolute inset-0 h-full w-full"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="SeenYT Demo"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guided Trial: wider container */}
        <section id="guided-trial" className="w-full px-6 pb-12 md:px-10 md:pb-16 lg:px-14">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-black text-white/60">Guided Trial</div>
                <h2 className="mt-2 text-2xl font-black md:text-3xl">Đi đúng 3 bước, ra output ngay</h2>
                <p className="mt-2 max-w-2xl text-sm text-white/70">
                  Bước trước tạo đầu vào cho bước sau. Không bị “đứt gãy” workflow.
                </p>
              </div>

              <button
                onClick={() => goTo(TOOL_MICRO)}
                className="hidden rounded-2xl bg-gradient-to-r from-[#00ffb4] via-[#ff70d6] to-[#7a5cff] px-6 py-3 text-sm font-black text-black transition hover:brightness-110 md:block"
              >
                Bắt đầu ngay
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  step: "Bước 1",
                  title: "Micro Niche Miner",
                  desc: "Ra danh sách ngách khả thi. Mục tiêu: chọn 1 hướng rõ ràng để làm kênh.",
                  cta: "Dùng thử bước 1",
                  path: TOOL_MICRO,
                  primary: true,
                },
                {
                  step: "Bước 2",
                  title: "Scriptwriter",
                  desc: "Từ niche → outline + hook + cấu trúc để nói, quay và edit nhanh hơn.",
                  cta: "Dùng thử bước 2",
                  path: TOOL_SCRIPT,
                  primary: false,
                },
                {
                  step: "Bước 3",
                  title: "SEO YouTube",
                  desc: "Tối ưu metadata theo intent để tăng CTR và cơ hội đề xuất.",
                  cta: "Dùng thử bước 3",
                  path: TOOL_SEO,
                  primary: false,
                },
              ].map((x, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur"
                >
                  <div className="text-xs text-white/60">{x.step}</div>
                  <div className="mt-1 text-lg font-black">{x.title}</div>
                  <p className="mt-2 text-sm text-white/70">{x.desc}</p>
                  <button
                    onClick={() => goTo(x.path)}
                    className={classNames(
                      "mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black transition hover:brightness-110",
                      x.primary
                        ? "bg-[#00ffb4] text-black"
                        : "border border-white/10 bg-white/5 text-white/90 hover:bg-white/10"
                    )}
                  >
                    {x.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tool previews: wider container */}
        <section className="w-full px-6 pb-20 md:px-10 lg:px-14">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-black text-white/60">Tool Preview</div>
                <h3 className="mt-2 text-xl font-black md:text-2xl">Workflow trực quan</h3>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <VideoShot videoId="fwIst_IscQs" badge="Micro Niche" />
              <VideoShot videoId="NGLzDUTPvgs" badge="Scriptwriter" />
              <VideoShot videoId="M4UBTX8omq0" badge="SEO" />
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-black">Vào tool và làm luôn</div>
                  <div className="mt-1 text-sm text-white/70">Chọn path → vào đúng tool → ra output. Không vòng vo.</div>
                </div>

                <button
                  onClick={() => goTo(primaryCta.path)}
                  className="rounded-2xl bg-gradient-to-r from-[#00ffb4] via-[#ff70d6] to-[#7a5cff] px-6 py-4 text-sm font-black text-black transition hover:brightness-110"
                >
                  {isLoggedIn ? primaryCta.label : "Dùng thử miễn phí (Login Google)"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky CTA: wider container */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-6 py-3 md:px-10 lg:px-14">
            <button onClick={jumpToChoosePath} className="min-w-0 text-left" title="Click để chọn path">
              <div className="truncate text-xs font-black text-white/90">
                {mounted && SHOW_SLOTS ? `Còn ${slotsLeft}/${TOTAL_SLOTS} suất · ` : ""}
                Hết sau{" "}
                <span className="bg-gradient-to-r from-[#00ffb4] via-[#ff70d6] to-[#7a5cff] bg-clip-text text-transparent">
                  {timeText}
                </span>
              </div>
              <div className="truncate text-[11px] text-white/60">
                {choice ? `Đang chọn: ${primaryCta.label}` : "Chọn 1 path để vào đúng tool ngay"}
              </div>
            </button>

            <button
              onClick={() => goTo(primaryCta.path)}
              className="shrink-0 rounded-2xl bg-gradient-to-r from-[#00ffb4] via-[#ff70d6] to-[#7a5cff] px-5 py-3 text-sm font-black text-black transition hover:brightness-110"
              style={{ animation: mounted ? "nudge 1.4s ease-in-out infinite" : undefined }}
            >
              {isLoggedIn ? "Vào tool" : "Login Google"}
            </button>
          </div>
        </div>

        <div className="h-20" />
      </main>
    </>
  );
}
