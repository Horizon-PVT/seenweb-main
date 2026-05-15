import type { CanonicalToolId, WorkflowId } from "@/lib/creator-workflows";

export type AppLocale = "vi" | "en" | "ja";

type WorkflowCopy = Record<WorkflowId, { title: string; subtitle: string; description: string; steps: string[] }>;
type ToolCopy = Record<CanonicalToolId, { title: string; shortTitle: string; description: string }>;

export function getAppLocale(locale?: string): AppLocale {
  if (locale === "en" || locale === "ja") return locale;
  return "vi";
}

export const CREATOR_I18N: Record<
  AppLocale,
  {
    nav: {
      home: string;
      homeDesc: string;
      workflows: string;
      workflowsDesc: string;
      aiCoach: string;
      aiCoachDesc: string;
      projects: string;
      projectsDesc: string;
      account: string;
      accountDesc: string;
      billing: string;
      billingDesc: string;
      main: string;
      coreTools: string;
      accountGroup: string;
      signOut: string;
      accountSettings: string;
      planBilling: string;
    };
    mobile: {
      home: string;
      flow: string;
      niche: string;
      create: string;
      seo: string;
      coach: string;
      account: string;
    };
    dashboard: {
      badge: string;
      greeting: string;
      intro: string;
      startWorkflow: string;
      askCoach: string;
      workspace: string;
      starterAccess: string;
      activeWorkspace: string;
      workflows: string;
      tools: string;
      aiCoach: string;
      productRuleTitle: string;
      productRuleBody: string;
      selectedWorkflow: string;
      workflowMap: string;
      canonicalIds: string;
      registryTitle: string;
      registryBody: string;
      toolboxKicker: string;
      toolboxTitle: string;
      toolboxBody: string;
      planBilling: string;
      cleanupKicker: string;
      cleanupTitle: string;
      cleanupBody: string;
      nextDecisionsKicker: string;
      nextDecisionsTitle: string;
      nextDecisions: string[];
      ready: string;
      review: string;
      hidden: string;
    };
    workflows: WorkflowCopy;
    tools: ToolCopy;
  }
> = {
  vi: {
    nav: {
      home: "Home",
      homeDesc: "Tổng quan workspace",
      workflows: "Workflows",
      workflowsDesc: "Hệ thống làm kênh YouTube",
      aiCoach: "AI Coach",
      aiCoachDesc: "Chiến lược và bước tiếp theo",
      projects: "Projects",
      projectsDesc: "Bản nháp và công việc kênh",
      account: "Account",
      accountDesc: "Hồ sơ và tuỳ chọn",
      billing: "Billing",
      billingDesc: "Gói và thanh toán",
      main: "Main",
      coreTools: "Core tools",
      accountGroup: "Account",
      signOut: "Đăng xuất",
      accountSettings: "Cài đặt tài khoản",
      planBilling: "Gói và thanh toán",
    },
    mobile: {
      home: "Home",
      flow: "Flow",
      niche: "Niche",
      create: "Create",
      seo: "SEO",
      coach: "Coach",
      account: "Account",
    },
    dashboard: {
      badge: "YouTube Content Operating System",
      greeting: "Hôm nay mình làm kênh theo workflow nào?",
      intro:
        "Dashboard bắt đầu từ mục tiêu làm kênh, không phải một danh sách tool rời rạc. Chọn workflow, rồi đi qua đúng tool ở đúng bước.",
      startWorkflow: "Bắt đầu workflow",
      askCoach: "Hỏi AI Coach",
      workspace: "Workspace",
      starterAccess: "Starter access",
      activeWorkspace: "Active workspace",
      workflows: "workflows",
      tools: "tools",
      aiCoach: "AI coach",
      productRuleTitle: "Nguyên tắc sản phẩm",
      productRuleBody:
        "Người dùng không cần nhớ tên tool. Họ chọn mục tiêu, SeenYT dẫn họ tới đúng bước tiếp theo.",
      selectedWorkflow: "Selected workflow",
      workflowMap: "Workflow Map",
      canonicalIds: "Canonical IDs",
      registryTitle: "Canonical registry is active",
      registryBody: "Dashboard, sidebar, mobile nav và query aliases đang dùng cùng nguồn tool/workflow.",
      toolboxKicker: "Toolbox",
      toolboxTitle: "Các tool hiện tại đã được map vào hệ thống mới",
      toolboxBody: "Mỗi tool có canonical ID, alias cho code cũ, workflow stage và trạng thái review.",
      planBilling: "Gói và thanh toán",
      cleanupKicker: "Cleanup rule",
      cleanupTitle: "Ẩn trước, xóa sau",
      cleanupBody:
        "Mình vẫn giữ code cũ cho tới khi kiểm tra xong route và API dependency. Phase 4 chuẩn hóa ID trước khi dọn mạnh.",
      nextDecisionsKicker: "Next decisions",
      nextDecisionsTitle: "Việc cần duyệt tiếp",
      nextDecisions: [
        "Giữ tool tạo giá trị rõ nhất cho người làm YouTube.",
        "Gom tool trùng chức năng vào workflow thay vì show lặp.",
        "Ẩn hoặc xóa tool không phục vụ niche, workflow, script, SEO, coaching.",
      ],
      ready: "Ready",
      review: "Review",
      hidden: "Hidden",
    },
    workflows: {
      "launch-channel": {
        title: "Khởi động kênh YouTube",
        subtitle: "Từ ngách đến kế hoạch nội dung 30 ngày đầu",
        description:
          "Dành cho creator mới hoặc kênh cần định vị lại: chọn ngách, xác định audience, phân tích đối thủ và tạo kế hoạch đăng đầu tiên.",
        steps: ["Tìm ngách", "Phân tích đối thủ", "Lập kế hoạch 30 ngày"],
      },
      "produce-video": {
        title: "Sản xuất một video",
        subtitle: "Từ một ý tưởng đến gói video sẵn sàng đăng",
        description:
          "Dành cho từng video cụ thể: viết kịch bản, tạo voice và caption, chuẩn bị brief sản xuất và đóng gói để đăng.",
        steps: ["Viết kịch bản", "Tạo voice và caption", "Đóng gói video"],
      },
      "improve-channel": {
        title: "Cải thiện hiệu suất kênh",
        subtitle: "Dùng SEO, insight và coaching để chọn bước tiếp theo",
        description:
          "Dành cho kênh đã có nội dung: tối ưu metadata, học từ dữ liệu, so sánh đối thủ và chọn thử nghiệm tiếp theo.",
        steps: ["Tối ưu metadata", "Review content intelligence", "Chọn bước tiếp theo"],
      },
    },
    tools: {
      "niche-radar": {
        title: "Niche Radar",
        shortTitle: "Niche",
        description: "Tìm ngách YouTube khả thi, audience, góc nội dung và cơ hội phát triển kênh.",
      },
      "rival-scanner": {
        title: "Rival Scanner",
        shortTitle: "Rivals",
        description: "Phân tích format, title, topic, thumbnail và pattern tăng trưởng của đối thủ.",
      },
      "script-studio": {
        title: "Script Studio",
        shortTitle: "Script",
        description: "Biến ý tưởng thành hook, outline, voice-over, CTA và phiên bản Shorts.",
      },
      "voice-studio": {
        title: "Voice Studio",
        shortTitle: "Voice",
        description: "Tạo voiceover, caption, dubbing và audio bản địa hóa cho video.",
      },
      "video-pipeline": {
        title: "Video Pipeline",
        shortTitle: "Video",
        description: "Kết nối script, voice, asset, caption, thumbnail brief và checklist đăng video.",
      },
      "seo-tool": {
        title: "SEO Tool",
        shortTitle: "SEO",
        description: "Tối ưu title, description, tag, keyword và metadata trước khi upload.",
      },
      "intelligence-hub": {
        title: "Intelligence Hub",
        shortTitle: "Intel",
        description: "Gom insight từ ngách, trend, đối thủ và dữ liệu kênh để ra quyết định.",
      },
      "ai-coach": {
        title: "AI Creator Coach",
        shortTitle: "Coach",
        description: "Review mục tiêu, làm rõ chiến lược và gợi ý hành động thực tế tiếp theo.",
      },
    },
  },
  en: {
    nav: {
      home: "Home",
      homeDesc: "Workspace overview",
      workflows: "Workflows",
      workflowsDesc: "YouTube operating system",
      aiCoach: "AI Coach",
      aiCoachDesc: "Strategy and next actions",
      projects: "Projects",
      projectsDesc: "Drafts and channel work",
      account: "Account",
      accountDesc: "Profile and preferences",
      billing: "Billing",
      billingDesc: "Plan and subscription",
      main: "Main",
      coreTools: "Core tools",
      accountGroup: "Account",
      signOut: "Sign out",
      accountSettings: "Account settings",
      planBilling: "Plan and billing",
    },
    mobile: {
      home: "Home",
      flow: "Flow",
      niche: "Niche",
      create: "Create",
      seo: "SEO",
      coach: "Coach",
      account: "Account",
    },
    dashboard: {
      badge: "YouTube Content Operating System",
      greeting: "choose the workflow for today's channel work.",
      intro:
        "This dashboard starts from the channel goal, not from a random list of tools. Pick the workflow, then move through the right tools in the right order.",
      startWorkflow: "Start workflow",
      askCoach: "Ask AI Coach",
      workspace: "Workspace",
      starterAccess: "Starter access",
      activeWorkspace: "Active workspace",
      workflows: "workflows",
      tools: "tools",
      aiCoach: "AI coach",
      productRuleTitle: "Product rule",
      productRuleBody:
        "Users should not need to remember tool names. They choose a goal, and SeenYT guides them to the right step.",
      selectedWorkflow: "Selected workflow",
      workflowMap: "Workflow Map",
      canonicalIds: "Canonical IDs",
      registryTitle: "Canonical registry is active",
      registryBody: "Dashboard, sidebar, mobile nav, and query aliases now share the same tool and workflow source.",
      toolboxKicker: "Toolbox",
      toolboxTitle: "Current tools mapped to the new product system",
      toolboxBody: "Each visible tool now has a canonical ID, aliases for old code, a workflow stage, and a review status.",
      planBilling: "Plan and billing",
      cleanupKicker: "Cleanup rule",
      cleanupTitle: "Hide first, delete later",
      cleanupBody:
        "We are keeping existing code until each route and API dependency is reviewed. Phase 4 standardizes IDs and routing before any destructive cleanup.",
      nextDecisionsKicker: "Next decisions",
      nextDecisionsTitle: "What we should review next",
      nextDecisions: [
        "Keep tools that clearly support YouTube channel growth.",
        "Merge overlapping tools into the workflow instead of showing duplicates.",
        "Hide or delete tools that do not support niche, workflow, script, SEO, or coaching.",
      ],
      ready: "Ready",
      review: "Review",
      hidden: "Hidden",
    },
    workflows: {
      "launch-channel": {
        title: "Launch a YouTube channel",
        subtitle: "From niche to the first 30-day content plan",
        description:
          "For new creators or channels that need clearer positioning: choose a niche, define the audience, map competitors, and create the first publishing plan.",
        steps: ["Find the niche", "Study competitors", "Build a 30-day plan"],
      },
      "produce-video": {
        title: "Produce a video",
        subtitle: "From one idea to a publish-ready video package",
        description:
          "For each video: write the script, create voice and captions, prepare the production brief, and package it for publishing.",
        steps: ["Write the script", "Create voice and captions", "Build the video package"],
      },
      "improve-channel": {
        title: "Improve channel performance",
        subtitle: "Use SEO, intelligence, and coaching to decide the next move",
        description:
          "For channels with existing content: improve metadata, learn from data, compare competitors, and choose the next experiment.",
        steps: ["Optimize publishing metadata", "Review content intelligence", "Choose the next action"],
      },
    },
    tools: {
      "niche-radar": {
        title: "Niche Radar",
        shortTitle: "Niche",
        description: "Find viable YouTube niches, audience angles, and channel opportunities.",
      },
      "rival-scanner": {
        title: "Rival Scanner",
        shortTitle: "Rivals",
        description: "Study competitor formats, titles, topics, thumbnails, and growth patterns.",
      },
      "script-studio": {
        title: "Script Studio",
        shortTitle: "Script",
        description: "Turn ideas into hooks, outlines, voice-over scripts, CTAs, and Shorts versions.",
      },
      "voice-studio": {
        title: "Voice Studio",
        shortTitle: "Voice",
        description: "Create voiceovers, captions, dubbing, and localized audio for video production.",
      },
      "video-pipeline": {
        title: "Video Pipeline",
        shortTitle: "Video",
        description: "Connect script, voice, assets, captions, thumbnail brief, and publishing checklist.",
      },
      "seo-tool": {
        title: "SEO Tool",
        shortTitle: "SEO",
        description: "Optimize titles, descriptions, tags, keywords, and upload metadata.",
      },
      "intelligence-hub": {
        title: "Intelligence Hub",
        shortTitle: "Intel",
        description: "Unify niche, trend, competitor, and channel insights for better decisions.",
      },
      "ai-coach": {
        title: "AI Creator Coach",
        shortTitle: "Coach",
        description: "Review goals, clarify strategy, and recommend the next practical action.",
      },
    },
  },
  ja: {
    nav: {
      home: "Home",
      homeDesc: "ワークスペース概要",
      workflows: "Workflows",
      workflowsDesc: "YouTube運用システム",
      aiCoach: "AI Coach",
      aiCoachDesc: "戦略と次の行動",
      projects: "Projects",
      projectsDesc: "下書きとチャンネル作業",
      account: "Account",
      accountDesc: "プロフィールと設定",
      billing: "Billing",
      billingDesc: "プランと支払い",
      main: "Main",
      coreTools: "Core tools",
      accountGroup: "Account",
      signOut: "ログアウト",
      accountSettings: "アカウント設定",
      planBilling: "プランと支払い",
    },
    mobile: {
      home: "Home",
      flow: "Flow",
      niche: "Niche",
      create: "Create",
      seo: "SEO",
      coach: "Coach",
      account: "Account",
    },
    dashboard: {
      badge: "YouTube Content Operating System",
      greeting: "今日進めるワークフローを選びましょう。",
      intro:
        "このダッシュボードはツール一覧ではなく、チャンネル目標から始まります。目的を選び、必要なツールを正しい順番で使います。",
      startWorkflow: "ワークフロー開始",
      askCoach: "AI Coachに相談",
      workspace: "Workspace",
      starterAccess: "Starter access",
      activeWorkspace: "Active workspace",
      workflows: "workflows",
      tools: "tools",
      aiCoach: "AI coach",
      productRuleTitle: "プロダクト原則",
      productRuleBody:
        "ユーザーがツール名を覚える必要はありません。目標を選ぶと、SeenYTが次の適切なステップへ案内します。",
      selectedWorkflow: "Selected workflow",
      workflowMap: "Workflow Map",
      canonicalIds: "Canonical IDs",
      registryTitle: "Canonical registry is active",
      registryBody: "Dashboard、sidebar、mobile nav、query alias は同じtool/workflow sourceを使用します。",
      toolboxKicker: "Toolbox",
      toolboxTitle: "現在のツールを新しいプロダクト構造に整理",
      toolboxBody: "各ツールにはcanonical ID、旧コード用alias、workflow stage、review statusがあります。",
      planBilling: "プランと支払い",
      cleanupKicker: "Cleanup rule",
      cleanupTitle: "まず非表示、削除は後で",
      cleanupBody:
        "各routeとAPI依存を確認するまで既存コードは残します。削除前にIDとルーティングを標準化します。",
      nextDecisionsKicker: "Next decisions",
      nextDecisionsTitle: "次に確認すること",
      nextDecisions: [
        "YouTubeチャンネル成長に明確な価値があるツールを残す。",
        "重複するツールはワークフローに統合する。",
        "niche、workflow、script、SEO、coachingに関係しないツールは非表示または削除する。",
      ],
      ready: "Ready",
      review: "Review",
      hidden: "Hidden",
    },
    workflows: {
      "launch-channel": {
        title: "YouTubeチャンネルを始める",
        subtitle: "ニッチから最初の30日コンテンツ計画へ",
        description:
          "新規クリエイターや再定位が必要なチャンネル向け。ニッチ、視聴者、競合、最初の投稿計画を整理します。",
        steps: ["ニッチを見つける", "競合を分析する", "30日計画を作る"],
      },
      "produce-video": {
        title: "動画を制作する",
        subtitle: "一つのアイデアから公開準備済みパッケージへ",
        description:
          "各動画のために、台本、音声、字幕、制作ブリーフ、公開用パッケージを準備します。",
        steps: ["台本を書く", "音声と字幕を作る", "動画パッケージを作る"],
      },
      "improve-channel": {
        title: "チャンネルを改善する",
        subtitle: "SEO、分析、コーチングで次の一手を決める",
        description:
          "既存動画があるチャンネル向け。メタデータ改善、データ学習、競合比較、次の実験を決めます。",
        steps: ["公開メタデータを最適化", "コンテンツ分析を確認", "次の行動を選ぶ"],
      },
    },
    tools: {
      "niche-radar": {
        title: "Niche Radar",
        shortTitle: "Niche",
        description: "有望なYouTubeニッチ、視聴者角度、チャンネル機会を見つけます。",
      },
      "rival-scanner": {
        title: "Rival Scanner",
        shortTitle: "Rivals",
        description: "競合のフォーマット、タイトル、テーマ、サムネイル、成長パターンを分析します。",
      },
      "script-studio": {
        title: "Script Studio",
        shortTitle: "Script",
        description: "アイデアをフック、構成、ナレーション、CTA、Shorts版に展開します。",
      },
      "voice-studio": {
        title: "Voice Studio",
        shortTitle: "Voice",
        description: "動画制作向けに音声、字幕、吹き替え、ローカライズ音声を作成します。",
      },
      "video-pipeline": {
        title: "Video Pipeline",
        shortTitle: "Video",
        description: "台本、音声、素材、字幕、サムネイルブリーフ、公開チェックを接続します。",
      },
      "seo-tool": {
        title: "SEO Tool",
        shortTitle: "SEO",
        description: "タイトル、説明文、タグ、キーワード、アップロード用メタデータを最適化します。",
      },
      "intelligence-hub": {
        title: "Intelligence Hub",
        shortTitle: "Intel",
        description: "ニッチ、トレンド、競合、チャンネル分析を統合して判断を助けます。",
      },
      "ai-coach": {
        title: "AI Creator Coach",
        shortTitle: "Coach",
        description: "目標を整理し、戦略を明確にし、次の実行アクションを提案します。",
      },
    },
  },
};

export function getCreatorCopy(locale?: string) {
  return CREATOR_I18N[getAppLocale(locale)];
}
