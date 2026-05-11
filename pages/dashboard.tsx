import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHome from "@/components/dashboard/DashboardHome";

// Dynamic imports for performance
const KodaNicheRadar = dynamic(() => import('@/components/KodaNicheRadar'), { ssr: false });
const KodaScriptStudio = dynamic(() => import('@/components/KodaScriptStudio'), { ssr: false });
const SeoTool = dynamic(() => import('@/components/SeoTool'), { ssr: false });
const IntelligenceHub = dynamic(() => import('@/components/IntelligenceHub'), { ssr: false });
const VideoPipeline = dynamic(() => import('@/components/VideoPipeline'), { ssr: false });
const RivalScanner = dynamic(() => import('@/components/RivalScannerTool'), { ssr: false });

const TOOL_COMPONENTS: Record<string, any> = {
  'niche-radar': KodaNicheRadar,
  'script-studio': KodaScriptStudio,
  'seo-tool': SeoTool,
  'intelligence-hub': IntelligenceHub,
  'video-pipeline': VideoPipeline,
  'rival-scanner': RivalScanner,
};

const TOOL_TITLES: Record<string, string> = {
  'niche-radar': 'Niche Radar',
  'script-studio': 'Script Studio',
  'seo-tool': 'SEO Tool',
  'intelligence-hub': 'Intelligence Hub',
  'video-pipeline': 'Video Pipeline',
  'rival-scanner': 'Rival Scanner',
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Authentication guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  // Handle tool from URL query
  useEffect(() => {
    if (!loading && router.isReady) {
      if (router.query.tool) {
        setActiveTool(router.query.tool as string);
      } else {
        setActiveTool(null); // Reset to home if no tool in query
      }
    }
  }, [loading, router.isReady, router.query]);

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D10]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CDAD5A]"></div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || 'FREE';
  const ActiveComponent = activeTool ? TOOL_COMPONENTS[activeTool] : null;

  return (
    <DashboardLayout 
      userRole={userRole} 
      activeTool={activeTool}
      onToolSelect={(toolId) => {
        if (toolId) {
          router.push(`/dashboard?tool=${toolId}`, undefined, { shallow: true });
        } else {
          router.push('/dashboard', undefined, { shallow: true });
        }
      }}
    >
      <div className="min-h-full">
        {ActiveComponent ? (
          <div className="animate-fadeIn">
            <ActiveComponent onBack={() => router.push('/dashboard', undefined, { shallow: true })} />
          </div>
        ) : (
          <DashboardHome 
            userRole={userRole} 
            onToolSelect={(toolId) => {
              router.push(`/dashboard?tool=${toolId}`, undefined, { shallow: true });
            }}
            onNavigate={(path) => router.push(path)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = async ({ locale }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'vi', ['common'])),
    },
  };
};
