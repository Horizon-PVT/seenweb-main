import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TypewriterMarkdown from "@/components/ui/TypewriterMarkdown";
import {
  ArrowUp,
  Bot,
  Brain,
  Clock,
  FileText,
  Lightbulb,
  Loader2,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ThinkingMode = "fast" | "deep" | "max";

const QUICK_PROMPTS = [
  "Build a 30-day content plan for this channel",
  "Review my current workflow and tell me the next action",
  "Turn this niche into 10 video ideas",
  "Improve this title and thumbnail angle",
];

function getWorkflowStep(workflowId: string | string[] | undefined) {
  const workflow = Array.isArray(workflowId) ? workflowId[0] : workflowId;
  if (workflow === "launch-channel") return "build-plan";
  if (workflow === "improve-channel") return "next-action";
  return null;
}

function getSuggestedPrompts(content: string) {
  const markerIndex = content.toLowerCase().lastIndexOf("câu hỏi gợi ý");
  if (markerIndex === -1) return [];

  return content
    .slice(markerIndex)
    .split("\n")
    .map((line) => line.replace(/^[-*\d.\s"']+/, "").trim())
    .filter((line) => line.length > 12 && line.endsWith("?"))
    .slice(0, 4);
}

export default function AICoachWorkspace() {
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [animatedMessageId, setAnimatedMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMode, setThinkingMode] = useState<ThinkingMode>("deep");
  const [usage, setUsage] = useState<{ remaining: number; limit: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const workflowId = Array.isArray(router.query.workflow) ? router.query.workflow[0] : router.query.workflow;
  const channelId = Array.isArray(router.query.channel) ? router.query.channel[0] : router.query.channel;

  useEffect(() => {
    fetch("/api/ai-coach/usage")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsage({ remaining: data.data.remaining, limit: data.data.limit });
        }
      })
      .catch(() => {});
  }, [messages.length]);

  useEffect(() => {
    const pending = localStorage.getItem("ai-coach-pending");
    if (pending) {
      setInput(pending);
      localStorage.removeItem("ai-coach-pending");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isLoading]);

  const saveCoachOutput = async (content: string, prompt: string) => {
    if (!session || !workflowId) return;

    const stepId = getWorkflowStep(workflowId);
    if (!stepId) return;

    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "ai-coach",
          name: `AI Coach: ${prompt.slice(0, 60) || "Workflow plan"}`,
          workflowId,
          stepId,
          channelId,
          data: {
            prompt,
            response: content,
            mode: thinkingMode,
            messages: [...messages, { id: "latest", role: "assistant", content }],
          },
        }),
      });
    } catch (error) {
      console.error("Failed to save AI Coach workflow output:", error);
    }
  };

  const handleSend = async (directMessage?: string) => {
    const text = (directMessage || input).trim();
    if (!text || isLoading) return;

    if (usage && usage.remaining <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Daily AI Coach limit reached. Upgrade or try again tomorrow.",
        },
      ]);
      return;
    }

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setStreamingContent("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-coach/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({ role: message.role, content: message.content })),
          mode: thinkingMode,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "AI Coach failed to respond.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream available.");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (!payload.trim()) continue;

          try {
            const data = JSON.parse(payload);
            if (data.type === "chunk" && data.content) {
              fullContent += data.content;
              setStreamingContent(fullContent);
            }
            if (data.type === "error") {
              throw new Error(data.error);
            }
          } catch (error) {
            if (error instanceof Error && error.message !== "Unexpected end of JSON input") {
              throw error;
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fullContent || "No response received.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setAnimatedMessageId(assistantMessage.id);
      setStreamingContent("");
      saveCoachOutput(assistantMessage.content, text);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: error.message || "AI Coach is unavailable right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const messageTypography =
    "prose prose-invert max-w-none whitespace-pre-wrap text-[15px] leading-7 prose-headings:mb-2.5 prose-headings:mt-4 prose-headings:font-black prose-p:my-2 prose-p:leading-7 prose-p:text-slate-200 prose-li:my-1 prose-li:leading-7 prose-li:text-slate-200 prose-ol:my-2.5 prose-ol:pl-5 prose-ul:my-2.5 prose-ul:pl-5 prose-strong:font-black prose-strong:text-white";

  return (
    <div className="grid h-full min-h-0 overflow-hidden bg-[#05080d] text-white lg:grid-cols-[340px_1fr]">
      <aside className="scrollbar-hide min-h-0 overflow-y-auto border-b border-white/10 bg-[#071018] p-5 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-300">
            <Bot size={22} />
          </div>
          <div>
            <div className="text-lg font-black">AI Creator Coach</div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Workflow native</div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <Target size={16} className="text-cyan-300" />
            Context
          </div>
          <div className="mt-3 space-y-2 text-sm text-slate-400">
            <div className="flex justify-between gap-3">
              <span>Workflow</span>
              <span className="font-bold text-cyan-100">{workflowId || "General"}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Mode</span>
              <span className="font-bold capitalize text-cyan-100">{thinkingMode}</span>
            </div>
            {usage && (
              <div className="flex justify-between gap-3">
                <span>Daily uses</span>
                <span className="font-bold text-cyan-100">{usage.remaining}/{usage.limit}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Thinking Mode</div>
          <div className="grid grid-cols-3 gap-2">
            {(["fast", "deep", "max"] as ThinkingMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setThinkingMode(mode)}
                className={`rounded-lg border px-3 py-2 text-xs font-black capitalize transition ${
                  thinkingMode === mode
                    ? "border-cyan-300/45 bg-cyan-300/10 text-cyan-100"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Quick Prompts</div>
          <div className="space-y-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="flex w-full items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-left text-sm text-slate-300 transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.05]"
              >
                <Lightbulb size={15} className="mt-0.5 shrink-0 text-cyan-300" />
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([]);
            setStreamingContent("");
            inputRef.current?.focus();
          }}
          className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] text-sm font-black text-white transition hover:border-cyan-300/40"
        >
          <Plus size={16} />
          New Chat
        </button>
      </aside>

      <main className="relative flex min-h-0 flex-col overflow-hidden">
        <div className="shrink-0 flex items-center justify-between border-b border-white/10 bg-[#071018] px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-black text-cyan-100">
            <Sparkles size={16} className="text-cyan-300" />
            Ask for the next practical production move
          </div>
          <div className="hidden items-center gap-4 text-xs font-bold text-slate-500 md:flex">
            <span className="inline-flex items-center gap-1.5"><Clock size={13} /> Streaming</span>
            <span className="inline-flex items-center gap-1.5"><FileText size={13} /> Auto-attaches plans</span>
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 py-6">
          <div className="mx-auto max-w-5xl space-y-4">
            {messages.length === 0 && !streamingContent && !isLoading && (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
                <Brain size={54} className="text-cyan-300/70" />
                <h2 className="mt-5 text-2xl font-black text-white">What should we produce next?</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  Use AI Coach inside the current workflow so plans, next actions, and strategic decisions stay attached to this workspace.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[min(920px,94%)] rounded-xl border px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)] ${
                    message.role === "user"
                      ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-50"
                      : "border-white/10 bg-[#10151d] text-slate-200"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <>
                      <div className={messageTypography}>
                        <TypewriterMarkdown content={message.content} enabled={animatedMessageId === message.id} speed={4} />
                      </div>
                      {getSuggestedPrompts(message.content).length > 0 && (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <div className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-300/70">Dùng ngay gợi ý</div>
                          <div className="flex flex-wrap gap-2">
                            {getSuggestedPrompts(message.content).map((prompt) => (
                              <button
                                key={prompt}
                                onClick={() => handleSend(prompt)}
                                disabled={isLoading}
                                className="rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-3 py-2 text-left text-xs font-bold leading-5 text-cyan-50 transition hover:border-cyan-300/50 hover:bg-cyan-300/[0.13] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="whitespace-pre-wrap text-[15px] leading-7">{message.content}</div>
                  )}
                </div>
              </div>
            ))}

            {streamingContent && (
              <div className="max-w-[min(920px,94%)] rounded-xl border border-white/10 bg-[#10151d] px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Loader2 size={14} className="animate-spin" />
                  AI Coach is responding
                </div>
                <div className={messageTypography}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                </div>
              </div>
            )}

            {isLoading && !streamingContent && (
              <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                <Loader2 size={16} className="animate-spin text-cyan-300" />
                Thinking through the workflow context...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="shrink-0 bg-[#05080d] px-5 py-4">
          <div className="mx-auto flex max-w-5xl gap-3 rounded-xl border border-white/10 bg-[#0b1118] p-3 shadow-[0_16px_50px_rgba(0,0,0,0.24)]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask AI Coach for a workflow plan, next action, title angle, or production decision..."
              className="max-h-40 min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-600"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-cyan-300 text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
