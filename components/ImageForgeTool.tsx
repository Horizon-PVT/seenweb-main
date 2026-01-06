import React, { useEffect, useMemo, useRef, useState } from "react";

type Aspect = "16:9" | "1:1" | "9:16";

type RefUpload = {
  id: string;
  file: File;
  previewUrl: string;
};

const ARCHIVE_KEY = "seen_img_cache_v2";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = (e) => reject(e);
  });
}

// Safe fetch JSON: handle 413 HTML responses gracefully
async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { error: text?.slice(0, 300) || `HTTP ${res.status}` };
}

const ImageForgeTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<Aspect>("16:9");
  const [numImages, setNumImages] = useState<number>(2);

  const [isLoading, setIsLoading] = useState(false);
  const [isMagic, setIsMagic] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [archive, setArchive] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  // References
  const [styleRef, setStyleRef] = useState<File | null>(null);
  const [characterRefs, setCharacterRefs] = useState<RefUpload[]>([]);
  const [faceLock, setFaceLock] = useState(true);

  // Preview modal
  const [selected, setSelected] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const hasAnyRefs = !!styleRef || characterRefs.length > 0;

  useEffect(() => {
    try {
      const cached = localStorage.getItem(ARCHIVE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setArchive(parsed.slice(0, 12));
      }
    } catch { }
  }, []);

  const persistArchive = (next: string[]) => {
    const trimmed = next.slice(0, 12);
    setArchive(trimmed);
    try {
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(trimmed));
    } catch { }
  };

  const handleClear = () => {
    if (confirm("Xóa hết kho ảnh?")) {
      setArchive([]);
      try {
        localStorage.removeItem(ARCHIVE_KEY);
      } catch { }
    }
  };

  const addCharacterRef = (file: File | null) => {
    if (!file) return;
    if (characterRefs.length >= 3) {
      setError("Tối đa 3 ảnh nhân vật tham chiếu.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setCharacterRefs((prev) => [...prev, { id: uid(), file, previewUrl }]);
  };

  const removeCharacterRef = (id: string) => {
    setCharacterRefs((prev) => prev.filter((x) => x.id !== id));
  };

  const clearRefs = () => {
    setStyleRef(null);
    setCharacterRefs([]);
  };

  const submitDisabled = useMemo(() => {
    return isLoading || (!prompt.trim() && !hasAnyRefs);
  }, [isLoading, prompt, hasAnyRefs]);

  const handleMagicPrompt = async () => {
    setError("");
    const p = prompt.trim();
    if (!p) {
      setError("Nhập prompt trước khi dùng Magic Prompt.");
      inputRef.current?.focus();
      return;
    }

    setIsMagic(true);
    try {
      const res = await fetch("/api/magic-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: p,
          aspectRatio,
          numImages,
          hasStyleRef: !!styleRef,
          characterCount: characterRefs.length,
        }),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      if (!data?.prompt) throw new Error("Magic prompt không trả prompt.");

      setPrompt(data.prompt);
    } catch (e: any) {
      setError(e?.message || "Magic prompt lỗi.");
    } finally {
      setIsMagic(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!prompt.trim() && !hasAnyRefs) {
      setError("Nhập prompt hoặc upload ảnh tham chiếu (style/nhân vật).");
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        prompt: prompt.trim() || "Generate image using references.",
        numImages: Math.max(1, Math.min(4, numImages)),
        aspectRatio,
        faceLock: !!faceLock,
      };

      if (styleRef) {
        payload.styleRef = {
          base64: await fileToBase64(styleRef),
          mimeType: styleRef.type,
        };
      }

      if (characterRefs.length) {
        payload.characterRefs = await Promise.all(
          characterRefs.map(async (r) => ({
            base64: await fileToBase64(r.file),
            mimeType: r.file.type,
          }))
        );
      }

      const res = await fetch("/api/image-forge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!res.ok) {
        // Friendly message for 413
        if (res.status === 413) {
          throw new Error("Ảnh tham chiếu quá lớn. Hãy dùng ảnh < 5MB hoặc giảm kích thước ảnh.");
        }
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      if (data.generatedImages && Array.isArray(data.generatedImages)) {
        const out = data.generatedImages as string[];
        setImages(out);

        const nextArchive = [...out, ...archive].slice(0, 12);
        persistArchive(nextArchive);
      } else {
        throw new Error("Không nhận được ảnh từ server.");
      }
    } catch (e: any) {
      setError(e?.message || "Lỗi!");
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard: Ctrl/Cmd + Enter
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
        ev.preventDefault();
        if (!submitDisabled) handleSubmit();
      }
      if (ev.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitDisabled, handleSubmit]);

  // COLOR THEME: gold / red / white (still premium)
  const gold = "text-[#F5C542]";
  const redBtn = "bg-[#C1121F] hover:bg-[#A50F19]";
  const panel = "bg-white/[0.04] border border-white/10";
  const soft = "text-white/70";

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-[#07050A] via-[#070810] to-[#05050A] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="h-[72px] px-8 flex justify-between items-center border-b border-white/10 shadow-xl bg-black/30 backdrop-blur">
        <button
          onClick={onBack}
          className={`px-4 py-2 rounded-xl text-[10px] uppercase border border-white/10 bg-white/5 hover:bg-white/10 font-bold ${gold}`}
        >
          ← Quay lại Menu
        </button>

        <h1 className="text-xl font-black tracking-wide">
          SEENYT <span className={gold}>VISION</span>
        </h1>

        <button
          onClick={clearRefs}
          className="px-3 py-2 rounded-xl text-[10px] uppercase border border-white/10 bg-white/5 hover:bg-white/10 font-bold text-white/80"
        >
          Clear Refs
        </button>
      </header>

      <div className="flex-grow flex overflow-hidden">
        {/* LEFT: History */}
        <aside className="w-[220px] border-r border-white/5 p-4 flex flex-col gap-4 bg-white/[0.02]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] opacity-60 font-bold tracking-widest">LỊCH SỬ</span>
            <button onClick={handleClear} className="text-[9px] text-red-300 hover:text-red-200">
              Xóa
            </button>
          </div>

          <div className="flex flex-col gap-3 overflow-auto pr-1">
            {archive.length === 0 && (
              <div className="text-[10px] opacity-45">Chưa có ảnh. Generate để lưu vào kho.</div>
            )}
            {archive.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img}
                onClick={() => setSelected(img)}
                className="rounded-xl border border-white/10 hover:border-[#F5C542]/40 cursor-pointer transition"
                alt={`archive-${i}`}
              />
            ))}
          </div>
        </aside>

        {/* CENTER */}
        {/* CENTER */}
        <main className="flex-grow relative flex flex-col overflow-hidden bg-[#07050A]">
          {/* SCROLLABLE CONTENT */}
          <div className="flex-grow overflow-y-auto p-8 pb-32 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="flex flex-col items-center min-h-full justify-center">

              {isLoading ? (
                <div className="flex flex-col items-center gap-4 animate-pulse">
                  <div className="w-16 h-16 border-4 border-[#F5C542] border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(245,197,66,0.2)]" />
                  <div className="text-sm text-[#F5C542] font-bold tracking-widest">ĐANG SÁNG TẠO TÁC PHẨM...</div>
                </div>
              ) : images.length > 0 ? (
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="group relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 hover:border-[#F5C542]/50 transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        onClick={() => setSelected(img)}
                        className={`w-full h-auto object-cover cursor-pointer ${aspectRatio === "1:1" ? "aspect-square" :
                            aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"
                          }`}
                        alt={`generated-${i}`}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full border border-white/20">Click để xem</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`w-full max-w-2xl rounded-3xl ${panel} p-12 text-center backdrop-blur-sm`}>
                  <div className="w-16 h-16 bg-[#F5C542]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#F5C542]/20 text-3xl">
                    🎨
                  </div>
                  <div className={`text-xl font-bold ${gold} mb-2 tracking-wide`}>STUDIO ĐÃ SẴN SÀNG</div>
                  <div className={`text-sm ${soft} leading-relaxed max-w-md mx-auto`}>
                    Hãy mô tả ý tưởng của bạn bên dưới. <br />
                    Kết hợp <strong>Style Reference</strong> và <strong>Face Lock</strong> để có kết quả chuyên nghiệp nhất.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FLOATING CHAT BAR */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-[#05050A] via-[#05050A]/95 to-transparent flex justify-center z-10">
            <div className="w-full max-w-4xl p-2 rounded-[24px] border border-white/15 flex gap-2 items-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-[#1A1A20]/90 backdrop-blur-md">
              <input
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!submitDisabled) handleSubmit();
                  }
                }}
                placeholder="Mô tả ý tưởng của anh (Ví dụ: Mèo máy Doraemon phong cách Cyberpunk)..."
                className="flex-grow bg-transparent border-none focus:ring-0 text-white px-5 py-3 text-sm outline-none placeholder:text-white/30"
              />

              <div className="h-8 w-px bg-white/10 mx-1"></div>

              <button
                onClick={handleMagicPrompt}
                disabled={isMagic}
                className={`px-4 py-2.5 rounded-xl font-bold uppercase text-[10px] border border-white/10 bg-white/5 hover:bg-white/10 ${gold} disabled:opacity-50 transition-colors flex flex-col items-center leading-none gap-0.5 min-w-[60px]`}
                title="Tự động viết lại prompt hay hơn"
              >
                <span>✨</span>
                <span>{isMagic ? "..." : "Magic"}</span>
              </button>

              <div className="flex flex-col gap-0.5">
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as Aspect)}
                  className="bg-black/40 border border-white/10 text-white text-[10px] rounded-lg px-2 py-1 outline-none hover:bg-white/5 cursor-pointer"
                  title="Tỉ lệ ảnh"
                >
                  <option value="16:9">16:9</option>
                  <option value="1:1">1:1</option>
                  <option value="9:16">9:16</option>
                </select>

                <select
                  value={numImages}
                  onChange={(e) => setNumImages(parseInt(e.target.value, 10))}
                  className="bg-black/40 border border-white/10 text-white text-[10px] rounded-lg px-2 py-1 outline-none hover:bg-white/5 cursor-pointer"
                  title="Số lượng ảnh"
                >
                  <option value={1}>1 ảnh</option>
                  <option value={2}>2 ảnh</option>
                  <option value={3}>3 ảnh</option>
                  <option value={4}>4 ảnh</option>
                </select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitDisabled}
                className={`ml-1 text-white px-6 py-3.5 rounded-xl font-black uppercase text-[11px] tracking-wider transition-all disabled:opacity-50 disabled:grayscale hover:shadow-[0_0_20px_#C1121F] ${redBtn}`}
              >
                Tạo Ảnh
              </button>
            </div>
          </div>

          {error && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 text-xs text-red-200 bg-red-900/80 border border-red-500/50 rounded-full px-6 py-2 shadow-lg backdrop-blur animate-bounce">
              ⚠️ {error}
            </div>
          )}
        </main>

        {/* RIGHT */}
        <aside className="w-[340px] border-l border-white/5 p-6 bg-white/[0.02] overflow-auto">
          {/* Style reference */}
          <div className="mb-6">
            <span className={`text-[10px] opacity-70 font-bold tracking-widest block mb-3 ${gold}`}>
              PHONG CÁCH THAM CHIẾU
            </span>

            <div className={`rounded-2xl ${panel} p-3`}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-white/80">Style Reference</div>
                <label className={`text-[10px] font-bold uppercase px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer ${gold}`}>
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setStyleRef(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="aspect-square rounded-2xl border-2 border-dashed border-white/10 relative overflow-hidden bg-black/25">
                {styleRef ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={URL.createObjectURL(styleRef)} className="w-full h-full object-cover" alt="style-ref" />
                ) : (
                  <div className="h-full flex items-center justify-center opacity-40 text-xs">
                    Upload style để giữ tone/ánh sáng/vibe
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Character refs */}
          <div className="mb-6">
            <div className="flex items-end justify-between mb-3">
              <span className={`text-[10px] opacity-70 font-bold tracking-widest block ${gold}`}>
                NHÂN VẬT THAM CHIẾU
              </span>
              <label className={`text-[10px] font-bold uppercase px-3 py-2 rounded-xl cursor-pointer text-white ${redBtn}`}>
                + Add
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => addCharacterRef(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {characterRefs.map((r) => (
                <div key={r.id} className={`relative rounded-2xl overflow-hidden ${panel} bg-black/20`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.previewUrl} className="w-full h-[140px] object-cover" alt="char-ref" />
                  <button
                    onClick={() => removeCharacterRef(r.id)}
                    className="absolute top-2 right-2 bg-black/60 border border-white/10 text-white/90 text-xs rounded-lg px-2 py-1 hover:bg-black/75"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}

              {characterRefs.length === 0 && (
                <div className={`col-span-2 text-xs ${soft} ${panel} rounded-2xl p-4`}>
                  Thêm 1–3 ảnh nhân vật để đồng nhất gương mặt/identity.
                </div>
              )}
            </div>
          </div>

          {/* Face Lock */}
          <div className={`rounded-2xl ${panel} p-4`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className={`text-xs font-bold ${gold}`}>Auto khóa Face Lock</div>
                <div className="text-[10px] text-white/55 mt-1">
                  Giữ identity theo character refs (khuyến nghị bật)
                </div>
              </div>

              <button
                onClick={() => setFaceLock((v) => !v)}
                className={`w-14 h-8 rounded-full border transition relative ${faceLock ? "bg-[#F5C542] border-[#F5C542]" : "bg-white/10 border-white/20"
                  }`}
                aria-label="toggle-face-lock"
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full shadow transition ${faceLock ? "left-7 bg-[#111]" : "left-1 bg-white"
                    }`}
                />
              </button>
            </div>

            <div className="mt-3 text-[10px] text-white/55">
              Face Lock mạnh nhất khi ảnh rõ mặt, ánh sáng tốt, ít filter.
            </div>
          </div>
        </aside>
      </div>

      {/* Modal preview */}
      {selected && (
        <div
          className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-w-[1100px] w-full rounded-3xl overflow-hidden border border-white/10 bg-black/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div className={`text-sm font-bold ${gold}`}>Preview</div>
              <button
                onClick={() => setSelected(null)}
                className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-white/80 text-xs border border-white/10"
              >
                Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected} alt="selected" className="w-full h-auto bg-black" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageForgeTool;
