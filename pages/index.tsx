import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  Clapperboard,
  FileText,
  Globe2,
  Layers,
  Play,
  Search,
  Sparkles,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { AppLocale, getAppLocale } from "@/lib/creator-i18n";

type ToolCard = {
  label: string;
  title: string;
  description: string;
  image: string;
  href: string;
  accent: string;
};

type Step = {
  title: string;
  description: string;
};

type Plan = {
  name: string;
  price: string;
  note: string;
  href: string;
  cta: string;
  popular?: boolean;
  features: string[];
};

const sharedTools = [
  { key: "niche", image: "/images/tool-niche-engine.jpg", href: "/dashboard?tool=niche-radar", accent: "cyan" },
  { key: "rival", image: "/images/tool-rival-scanner.jpg", href: "/dashboard?tool=rival-scanner", accent: "violet" },
  { key: "script", image: "/images/tool-scriptwriter.jpg", href: "/dashboard?tool=script-studio", accent: "amber" },
  { key: "voice", image: "/images/tool-tts.jpg", href: "/tools/multilingual-studio", accent: "emerald" },
  { key: "video", image: "/images/tool-velocity.jpg", href: "/dashboard?tool=video-pipeline", accent: "rose" },
  { key: "seo", image: "/images/tool-seo.jpg", href: "/dashboard?tool=seo-tool", accent: "blue" },
  { key: "coach", image: "/images/ai-coach.png", href: "/dashboard/ai-coach", accent: "cyan" },
] as const;

const accentClass: Record<string, string> = {
  cyan: "border-cyan-300/35 text-cyan-200 bg-cyan-300/10",
  violet: "border-violet-300/35 text-violet-200 bg-violet-300/10",
  amber: "border-amber-300/35 text-amber-200 bg-amber-300/10",
  emerald: "border-emerald-300/35 text-emerald-200 bg-emerald-300/10",
  rose: "border-rose-300/35 text-rose-200 bg-rose-300/10",
  blue: "border-blue-300/35 text-blue-200 bg-blue-300/10",
};

const copy = {
  vi: {
    metaTitle: "SeenYT - Hệ điều hành nội dung cho YouTube",
    metaDescription:
      "SeenYT giúp creator YouTube tìm ngách, phân tích đối thủ, xây workflow, viết kịch bản, sản xuất video, tối ưu SEO và cải thiện kênh bằng AI Coach.",
    nav: {
      tools: "Tools",
      workflow: "Workflow",
      coach: "AI Coach",
      pricing: "Pricing",
      login: "Đăng nhập",
      studio: "Mở Studio",
    },
    hero: {
      badge: "YouTube Content Operating System",
      title: "Xây kênh YouTube bằng workflow rõ ràng",
      highlight: "không phải bằng một đống tool rời rạc",
      body:
        "SeenYT gom nghiên cứu ngách, phân tích đối thủ, viết kịch bản, voice, video, SEO và AI coaching vào một luồng làm việc dễ hiểu cho creator.",
      primary: "Vào Studio",
      secondary: "Xem workflow",
      stats: [
        ["7", "core tools"],
        ["3", "workflow chính"],
        ["24/7", "AI Coach"],
        ["1", "hệ thống làm kênh"],
      ],
    },
    toolIntro: {
      badge: "Chọn mục tiêu trước",
      title: "Tool vẫn giữ, nhưng được đặt đúng chỗ",
      body:
        "Người dùng không cần nhớ tên từng công cụ. Họ chọn việc cần làm, SeenYT đưa họ tới đúng bước tiếp theo.",
    },
    tools: {
      niche: ["Nghiên cứu ngách", "Niche Radar", "Tìm thị trường khả thi, audience, góc nội dung và cơ hội phát triển kênh."],
      rival: ["Đối thủ", "Rival Scanner", "Bóc format, title, topic, thumbnail và pattern tăng trưởng của kênh cùng ngách."],
      script: ["Kịch bản", "Script Studio", "Biến ý tưởng thành hook, outline, voice-over, CTA và phiên bản Shorts."],
      voice: ["Voice & phụ đề", "Voice Studio", "Tạo voiceover, phụ đề, bản dịch và audio cho quy trình sản xuất."],
      video: ["Sản xuất", "Video Pipeline", "Kết nối script, voice, asset, caption, thumbnail brief và checklist đăng video."],
      seo: ["Tối ưu", "SEO Tool", "Tối ưu title, mô tả, tag, keyword và metadata trước khi upload."],
      coach: ["Chiến lược", "AI Creator Coach", "Review mục tiêu, làm rõ chiến lược và gợi ý hành động thực tế tiếp theo."],
    },
    workflow: {
      badge: "Creator workflow",
      title: "Từ ý tưởng kênh đến video đăng đều",
      body:
        "Homepage mới không bán cảm giác nhiều tính năng. Nó định vị SeenYT là hệ thống vận hành nội dung cho người làm YouTube.",
      steps: [
        { title: "Tìm ngách", description: "Chọn thị trường, hiểu người xem, tìm khoảng trống và góc vào kênh." },
        { title: "Lập kế hoạch", description: "Tạo content pillars, series, lịch đăng và checklist cho từng video." },
        { title: "Sản xuất", description: "Viết script, tạo voice, chuẩn bị asset, dựng video và thumbnail brief." },
        { title: "Tối ưu", description: "SEO metadata, kiểm tra kết quả, học lại pattern thắng và cập nhật vòng sau." },
      ],
      boardTitle: "Launch Channel Workflow",
      boardSubtitle: "Niche -> Plan -> Script -> Voice -> Video -> SEO -> Review",
      boardCta: "Chạy workflow",
    },
    coach: {
      badge: "AI Coach",
      title: "Không chỉ hỏi đáp, mà dẫn creator đi đúng bước",
      body:
        "AI Coach hiểu mục tiêu kênh, năng lực hiện tại và workflow đang chạy để gợi ý việc nên làm tiếp theo.",
      prompts: ["Kênh này nên đi ngách nào?", "30 ngày đầu đăng gì?", "Video này yếu ở đâu?", "Title nào dễ click hơn?"],
      personas: [
        ["Creator mới", "Cần chọn ngách, lịch đăng và video đầu tiên để không bị rối."],
        ["Kênh đang tăng trưởng", "Cần chuẩn hóa workflow, tăng sản lượng và học từ dữ liệu cũ."],
        ["Team / agency", "Cần nghiên cứu nhiều ngách, chia việc và sản xuất theo batch."],
      ],
    },
    pricing: {
      badge: "Gói đơn giản",
      title: "Trả tiền cho workflow, không phải sự rối rắm",
      body: "Giữ ít gói, dễ hiểu: dùng thử để trải nghiệm, Creator để làm kênh đều, Pro Workflow cho team cần quy trình sâu hơn.",
      plans: [
        {
          name: "Trial",
          price: "Miễn phí",
          note: "Khám phá hệ thống trước khi nâng cấp",
          href: "/login",
          cta: "Bắt đầu",
          features: ["Workflow cơ bản", "Một số tool chọn lọc", "AI Coach giới hạn"],
        },
        {
          name: "Creator",
          price: "Từ 169.000đ",
          note: "Cho creator muốn làm kênh đều đặn",
          href: "/pricing",
          cta: "Xem gói Creator",
          popular: true,
          features: ["Core YouTube tools", "Workflow sản xuất video", "Lưu dự án và lịch sử", "Hỗ trợ script và SEO"],
        },
        {
          name: "Pro Workflow",
          price: "Theo nhu cầu",
          note: "Cho team cần setup quy trình riêng",
          href: "/dashboard?workflow=launch-channel",
          cta: "Xem workflow",
          features: ["Thiết kế workflow", "Nghiên cứu ngách theo mục tiêu", "Batch production", "AI Coach sâu hơn"],
        },
      ] satisfies Plan[],
    },
    footer: "Hệ điều hành nội dung cho người làm YouTube.",
  },
  en: {
    metaTitle: "SeenYT - YouTube Content Operating System",
    metaDescription:
      "SeenYT helps YouTube creators research niches, analyze competitors, build workflows, write scripts, produce videos, optimize SEO, and improve with AI Coach.",
    nav: { tools: "Tools", workflow: "Workflow", coach: "AI Coach", pricing: "Pricing", login: "Log in", studio: "Open Studio" },
    hero: {
      badge: "YouTube Content Operating System",
      title: "Build YouTube channels with a clear workflow",
      highlight: "not with a pile of disconnected tools",
      body:
        "SeenYT connects niche research, competitor intelligence, scripting, voice, video production, SEO, and AI coaching into one creator workflow.",
      primary: "Enter Studio",
      secondary: "View workflow",
      stats: [
        ["7", "core tools"],
        ["3", "main workflows"],
        ["24/7", "AI Coach"],
        ["1", "channel system"],
      ],
    },
    toolIntro: {
      badge: "Start with the goal",
      title: "The tools stay, but they now have a job",
      body:
        "Creators should not have to memorize every tool name. They choose the job to be done, and SeenYT routes them to the right next step.",
    },
    tools: {
      niche: ["Niche research", "Niche Radar", "Find viable markets, audiences, content angles, and channel opportunities."],
      rival: ["Competitors", "Rival Scanner", "Break down formats, titles, topics, thumbnails, and growth patterns."],
      script: ["Scripts", "Script Studio", "Turn ideas into hooks, outlines, voice-over scripts, CTAs, and Shorts versions."],
      voice: ["Voice & captions", "Voice Studio", "Create voiceovers, captions, translations, and production-ready audio."],
      video: ["Production", "Video Pipeline", "Connect scripts, voice, assets, captions, thumbnail briefs, and upload checks."],
      seo: ["Optimization", "SEO Tool", "Optimize title, description, tags, keywords, and metadata before upload."],
      coach: ["Strategy", "AI Creator Coach", "Review goals, clarify strategy, and suggest the next practical action."],
    },
    workflow: {
      badge: "Creator workflow",
      title: "From channel idea to consistent publishing",
      body:
        "The new homepage does not sell feature overload. It positions SeenYT as a content operating system for YouTube creators.",
      steps: [
        { title: "Find the niche", description: "Choose the market, understand viewers, identify gaps, and define the channel angle." },
        { title: "Plan the channel", description: "Create pillars, series, publishing schedules, and video-level checklists." },
        { title: "Produce videos", description: "Write scripts, create voice, prepare assets, edit videos, and brief thumbnails." },
        { title: "Optimize", description: "Improve metadata, review results, learn winning patterns, and update the next cycle." },
      ],
      boardTitle: "Launch Channel Workflow",
      boardSubtitle: "Niche -> Plan -> Script -> Voice -> Video -> SEO -> Review",
      boardCta: "Run workflow",
    },
    coach: {
      badge: "AI Coach",
      title: "More than chat, it guides the creator's next step",
      body:
        "AI Coach understands the channel goal, current capacity, and active workflow to suggest what should happen next.",
      prompts: ["Which niche should this channel target?", "What should I publish in the first 30 days?", "Where is this video weak?", "Which title gets a better click?"],
      personas: [
        ["New creators", "Need a niche, schedule, and first videos without getting overwhelmed."],
        ["Growing channels", "Need to standardize workflow, increase output, and learn from old data."],
        ["Teams / agencies", "Need to research many niches, assign work, and produce in batches."],
      ],
    },
    pricing: {
      badge: "Simple plans",
      title: "Pay for workflow, not complexity",
      body: "Keep plans simple: Trial to explore, Creator for consistent publishing, Pro Workflow for teams that need deeper process.",
      plans: [
        { name: "Trial", price: "Free", note: "Explore the system before upgrading", href: "/login", cta: "Start", features: ["Basic workflow", "Selected tools", "Limited AI Coach"] },
        { name: "Creator", price: "From 169,000 VND", note: "For creators publishing consistently", href: "/pricing", cta: "View Creator", popular: true, features: ["Core YouTube tools", "Video production workflow", "Project history", "Script and SEO support"] },
        { name: "Pro Workflow", price: "Custom", note: "For teams that need a custom process", href: "/dashboard?workflow=launch-channel", cta: "View workflow", features: ["Workflow design", "Goal-based niche research", "Batch production", "Deeper AI Coach"] },
      ] satisfies Plan[],
    },
    footer: "Content operating system for YouTube creators.",
  },
  ja: {
    metaTitle: "SeenYT - YouTubeクリエイター向けコンテンツOS",
    metaDescription:
      "SeenYTはYouTubeクリエイターのニッチ調査、競合分析、ワークフロー、台本作成、動画制作、SEO、AI Coachによる改善を支援します。",
    nav: { tools: "ツール", workflow: "ワークフロー", coach: "AI Coach", pricing: "料金", login: "ログイン", studio: "Studioを開く" },
    hero: {
      badge: "YouTube Content Operating System",
      title: "明確なワークフローでYouTubeチャンネルを育てる",
      highlight: "バラバラのツールではなく、1つの運用システムで",
      body:
        "SeenYTはニッチ調査、競合分析、台本、音声、動画制作、SEO、AI coachingを1つのクリエイターワークフローにつなげます。",
      primary: "Studioへ",
      secondary: "ワークフローを見る",
      stats: [
        ["7", "主要ツール"],
        ["3", "主要ワークフロー"],
        ["24/7", "AI Coach"],
        ["1", "チャンネル運用システム"],
      ],
    },
    toolIntro: {
      badge: "目的から始める",
      title: "ツールは残し、役割を明確にする",
      body:
        "ユーザーが全ツール名を覚える必要はありません。目的を選ぶと、SeenYTが次に使うべきステップへ案内します。",
    },
    tools: {
      niche: ["ニッチ調査", "Niche Radar", "市場、視聴者、コンテンツ角度、チャンネル機会を見つけます。"],
      rival: ["競合分析", "Rival Scanner", "フォーマット、タイトル、テーマ、サムネイル、成長パターンを分析します。"],
      script: ["台本", "Script Studio", "アイデアをフック、構成、ナレーション、CTA、Shorts版へ展開します。"],
      voice: ["音声と字幕", "Voice Studio", "ナレーション、字幕、翻訳、制作向け音声を作成します。"],
      video: ["制作", "Video Pipeline", "台本、音声、素材、字幕、サムネイル指示、公開チェックをつなげます。"],
      seo: ["最適化", "SEO Tool", "公開前にタイトル、説明文、タグ、キーワード、メタデータを最適化します。"],
      coach: ["戦略", "AI Creator Coach", "目標を整理し、戦略と次の具体的な行動を提案します。"],
    },
    workflow: {
      badge: "Creator workflow",
      title: "チャンネル案から継続投稿まで",
      body:
        "新しいホームページは機能の多さではなく、YouTubeクリエイター向けのコンテンツ運用システムとしてSeenYTを見せます。",
      steps: [
        { title: "ニッチを見つける", description: "市場、視聴者、ギャップ、チャンネルの角度を整理します。" },
        { title: "計画する", description: "柱となるテーマ、シリーズ、投稿スケジュール、動画ごとのチェックリストを作ります。" },
        { title: "制作する", description: "台本、音声、素材、動画編集、サムネイル指示を準備します。" },
        { title: "最適化する", description: "SEO、結果分析、勝ちパターンの発見、次回ワークフローの改善を行います。" },
      ],
      boardTitle: "Launch Channel Workflow",
      boardSubtitle: "Niche -> Plan -> Script -> Voice -> Video -> SEO -> Review",
      boardCta: "実行する",
    },
    coach: {
      badge: "AI Coach",
      title: "ただのチャットではなく、次の一手を案内する",
      body:
        "AI Coachはチャンネル目標、現在のリソース、進行中のワークフローを理解し、次にやるべきことを提案します。",
      prompts: ["このチャンネルはどのニッチを狙うべき？", "最初の30日で何を投稿する？", "この動画の弱点は？", "クリックされやすいタイトルは？"],
      personas: [
        ["新規クリエイター", "ニッチ、投稿計画、最初の動画を迷わず決めたい人。"],
        ["成長中のチャンネル", "制作を標準化し、投稿量を増やし、過去データから学びたい人。"],
        ["チーム / 代理店", "複数ニッチを調査し、分業し、バッチ制作したいチーム。"],
      ],
    },
    pricing: {
      badge: "シンプルなプラン",
      title: "複雑さではなく、ワークフローに投資する",
      body: "プランはシンプルに。Trialで体験、Creatorで継続投稿、Pro Workflowでチーム向けの深い運用へ。",
      plans: [
        { name: "Trial", price: "無料", note: "アップグレード前に体験", href: "/login", cta: "開始する", features: ["基本ワークフロー", "一部ツール", "制限付きAI Coach"] },
        { name: "Creator", price: "169,000 VNDから", note: "継続投稿するクリエイター向け", href: "/pricing", cta: "Creatorを見る", popular: true, features: ["主要YouTubeツール", "動画制作ワークフロー", "プロジェクト履歴", "台本とSEO支援"] },
        { name: "Pro Workflow", price: "個別相談", note: "独自プロセスが必要なチーム向け", href: "/dashboard?workflow=launch-channel", cta: "ワークフローを見る", features: ["ワークフロー設計", "目的別ニッチ調査", "バッチ制作", "深いAI Coach"] },
      ] satisfies Plan[],
    },
    footer: "YouTubeクリエイター向けコンテンツOS。",
  },
} satisfies Record<AppLocale, any>;

function buildTools(locale: AppLocale): ToolCard[] {
  return sharedTools.map((tool) => {
    const [label, title, description] = copy[locale].tools[tool.key];
    return {
      label,
      title,
      description,
      image: tool.image,
      href: tool.href,
      accent: tool.accent,
    };
  });
}

const stepIcons = [Search, Layers, Clapperboard, TrendingUp];
const boardNodes = [
  { title: "Niche", icon: Search, detail: "Audience, gap, angle" },
  { title: "Plan", icon: Workflow, detail: "Pillars, series, schedule" },
  { title: "Script", icon: FileText, detail: "Hook, outline, VO" },
  { title: "Produce", icon: Clapperboard, detail: "Voice, assets, video" },
  { title: "Optimize", icon: BarChart3, detail: "SEO, review, learn" },
];

export default function Home() {
  const router = useRouter();
  const locale = getAppLocale(router.locale);
  const t = copy[locale];
  const tools = buildTools(locale);

  return (
    <div className="min-h-screen bg-[#070b10] text-white">
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
      </Head>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#070b10]/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/seenyt-mark.png" alt="SeenYT" width={36} height={36} priority className="rounded-lg" />
            <div>
              <div className="text-lg font-black leading-none">SeenYT</div>
              <div className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:block">Content OS</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold text-slate-300 md:flex">
            <a href="#tools" className="hover:text-cyan-300">{t.nav.tools}</a>
            <a href="#workflow" className="hover:text-cyan-300">{t.nav.workflow}</a>
            <a href="#coach" className="hover:text-cyan-300">{t.nav.coach}</a>
            <a href="#pricing" className="hover:text-cyan-300">{t.nav.pricing}</a>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border border-white/10 bg-white/5 p-1 text-xs font-black text-slate-400 sm:flex">
              {(["vi", "en", "ja"] as AppLocale[]).map((lang) => (
                <Link
                  key={lang}
                  href={router.asPath}
                  locale={lang}
                  className={`rounded-full px-2.5 py-1 uppercase ${locale === lang ? "bg-cyan-300 text-slate-950" : "hover:text-white"}`}
                >
                  {lang}
                </Link>
              ))}
            </div>
            <Link href="/login" className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:border-white/25 sm:inline-flex">
              {t.nav.login}
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-200">
              {t.nav.studio}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/10 px-4 pb-14 pt-28 sm:px-6 lg:pt-32">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#070b10_0%,#09131a_52%,#070b10_100%)]" />
          <div className="absolute inset-0 opacity-[0.24] [background-image:linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] [background-size:56px_56px]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
                <Sparkles size={16} className="text-cyan-300" />
                {t.hero.badge}
              </div>

              <h1 className="text-5xl font-black leading-[0.98] tracking-normal sm:text-6xl lg:text-7xl">
                {t.hero.title}
                <span className="block pt-3 italic text-cyan-300">{t.hero.highlight}</span>
              </h1>

              <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">{t.hero.body}</p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/dashboard" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cyan-300 px-7 text-sm font-black text-slate-950 hover:bg-cyan-200">
                  {t.hero.primary}
                  <ArrowRight size={17} />
                </Link>
                <a href="#workflow" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-sm font-bold text-white hover:border-cyan-300/50">
                  <Workflow size={17} className="text-cyan-300" />
                  {t.hero.secondary}
                </a>
              </div>

              <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-5 sm:grid-cols-4">
                {t.hero.stats.map((stat: string[]) => (
                  <div key={stat[1]} className="text-center">
                    <div className="text-3xl font-black text-white">{stat[0]}</div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{stat[1]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div id="tools" className="relative mt-14 -mx-4 sm:-mx-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-[#070b10] to-transparent sm:w-24" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-[#070b10] to-transparent sm:w-24" />
              <div className="flex gap-4 overflow-x-auto px-4 pb-5 sm:px-6 [scrollbar-width:none]">
                {tools.map((tool) => (
                  <Link key={tool.title} href={tool.href} className="group relative h-56 w-[304px] shrink-0 overflow-hidden rounded-lg border border-white/15 bg-slate-900">
                    <Image src={tool.image} alt={tool.title} fill sizes="304px" className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/52 to-transparent" />
                    <div className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[11px] font-black uppercase backdrop-blur ${accentClass[tool.accent]}`}>
                      {tool.label}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-xl font-black text-white">{tool.title}</div>
                      <p className="mt-2 text-sm font-medium leading-5 text-slate-300">{tool.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#070b10] px-4 py-20 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300">{t.toolIntro.badge}</div>
              <h2 className="text-4xl font-black leading-tight sm:text-5xl">{t.toolIntro.title}</h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-slate-400 lg:justify-self-end">{t.toolIntro.body}</p>
          </div>
        </section>

        <section id="workflow" className="border-b border-white/10 bg-[#081018] px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300">
                <Workflow size={16} className="text-cyan-300" />
                {t.workflow.badge}
              </div>
              <h2 className="text-4xl font-black leading-tight sm:text-6xl">{t.workflow.title}</h2>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-400">{t.workflow.body}</p>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="grid gap-4">
                {t.workflow.steps.map((step: Step, index: number) => {
                  const Icon = stepIcons[index];
                  return (
                    <div key={step.title} className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Step {index + 1}</div>
                        <h3 className="mt-1 text-xl font-black">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative overflow-hidden rounded-xl border border-cyan-300/25 bg-[#0c141d] p-5 shadow-[0_0_70px_rgba(34,211,238,0.12)]">
                <div className="absolute inset-0 opacity-[0.2] [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:42px_42px]" />
                <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="text-sm font-black">{t.workflow.boardTitle}</div>
                    <div className="mt-1 text-xs text-slate-500">{t.workflow.boardSubtitle}</div>
                  </div>
                  <Link href="/dashboard?workflow=launch-channel" className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-xs font-black text-slate-950">
                    <Play size={14} fill="currentColor" />
                    {t.workflow.boardCta}
                  </Link>
                </div>

                <div className="relative mt-7 grid gap-4 sm:grid-cols-2">
                  {boardNodes.map((node, index) => {
                    const Icon = node.icon;
                    return (
                      <div key={node.title} className={`rounded-lg border border-white/10 bg-[#111b25]/95 p-4 ${index === 1 || index === 3 ? "sm:translate-y-6" : ""}`}>
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-black">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-300">
                              <Icon size={16} />
                            </span>
                            {node.title}
                          </div>
                          <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                        </div>
                        <p className="text-sm leading-6 text-slate-400">{node.detail}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="relative mt-12 overflow-hidden rounded-lg border border-white/10">
                  <Image src="/images/thumbnail-strategy.png" alt="Creator workflow preview" width={900} height={420} className="h-56 w-full object-cover opacity-85" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-black">Creator dashboard</div>
                      <div className="text-sm text-slate-300">Every video belongs to a channel plan.</div>
                    </div>
                    <ChevronRight className="shrink-0 text-cyan-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="coach" className="border-b border-white/10 bg-[#070b10] px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300">
                  <Bot size={16} className="text-cyan-300" />
                  {t.coach.badge}
                </div>
                <h2 className="text-4xl font-black leading-tight sm:text-6xl">{t.coach.title}</h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">{t.coach.body}</p>
                <div className="mt-7 grid gap-3">
                  {t.coach.prompts.map((prompt: string) => (
                    <div key={prompt} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300">
                      <Sparkles size={16} className="text-cyan-300" />
                      {prompt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5">
                <div className="overflow-hidden rounded-xl border border-cyan-300/20 bg-white/[0.04] p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">AI Coach</div>
                      <div className="mt-1 text-lg font-black text-white">Next action board</div>
                    </div>
                    <span className="rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-black text-cyan-200">Live</span>
                  </div>
                  <div className="mt-5 grid gap-3">
                    <div className="max-w-[86%] rounded-lg border border-white/10 bg-[#101820] p-4">
                      <div className="text-xs font-bold text-slate-500">Creator goal</div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">Launch a faceless YouTube channel in 30 days.</p>
                    </div>
                    <div className="ml-auto max-w-[88%] rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
                      <div className="text-xs font-bold text-cyan-200">Suggested workflow</div>
                      <p className="mt-2 text-sm leading-6 text-slate-200">Start with Niche Radar, scan 5 rivals, then build a 12-video content plan.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {["Niche", "Rivals", "Plan"].map((item) => (
                        <div key={item} className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm font-black text-white">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  {t.coach.personas.map((persona: string[]) => (
                    <div key={persona[0]} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                      <div className="text-lg font-black">{persona[0]}</div>
                      <p className="mt-3 text-sm leading-6 text-slate-400">{persona[1]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[#081018] px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300">
                <Globe2 size={16} className="text-cyan-300" />
                {t.pricing.badge}
              </div>
              <h2 className="text-4xl font-black leading-tight sm:text-6xl">{t.pricing.title}</h2>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-400">{t.pricing.body}</p>
            </div>

            <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-3">
              {t.pricing.plans.map((plan: Plan) => (
                <div key={plan.name} className={`relative flex min-h-[430px] flex-col rounded-xl border p-7 ${plan.popular ? "border-cyan-300/60 bg-cyan-300/[0.08]" : "border-white/10 bg-white/[0.04]"}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-cyan-300 px-4 py-1 text-xs font-black uppercase tracking-[0.16em] text-slate-950">
                      Popular
                    </div>
                  )}
                  <h3 className="text-xl font-black">{plan.name}</h3>
                  <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-400">{plan.note}</p>
                  <div className="mt-5 text-3xl font-black">{plan.price}</div>
                  <ul className="mt-7 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-300">
                        <Check size={17} className="mt-1 shrink-0 text-cyan-300" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className={`mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full text-sm font-black ${plan.popular ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200" : "border border-white/15 bg-white/5 text-white hover:border-cyan-300/50"}`}>
                    {plan.cta}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#05080d] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/seenyt-mark.png" alt="SeenYT" width={28} height={28} />
            <span className="font-bold text-slate-300">SeenYT</span>
          </div>
          <div>{t.footer}</div>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard" className="hover:text-cyan-300">Dashboard</Link>
            <Link href="/dashboard/ai-coach" className="hover:text-cyan-300">AI Coach</Link>
            <Link href="/pricing" className="hover:text-cyan-300">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const getStaticProps = async ({ locale }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale || "vi", ["common"])),
  },
});
