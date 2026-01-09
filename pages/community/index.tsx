import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChannelSidebar from '@/components/community/ChannelSidebar';
import ChatArea from '@/components/community/ChatArea';
import LifePanel from '@/components/community/LifePanel';

export default function CommunityPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [channels, setChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Auth Check
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=/community');
        }
    }, [status, router]);

    // Fetch Channels
    useEffect(() => {
        fetch('/api/community/channels')
            .then(res => res.json())
            .then(data => {
                setChannels(data);
                if (data.length > 0) {
                    // Default to 'global' if exists, else first
                    const global = data.find((c: any) => c.slug === 'global');
                    setActiveChannel(global || data[0]);
                }
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    // Auto Chat Logic (Lifted State)
    const [autoChatEnabled, setAutoChatEnabled] = useState(false);
    const userRole = (session?.user as any)?.role || 'FREE';

    // Check status on mount
    useEffect(() => {
        if (userRole === 'ADMIN' || userRole === 'MOD') {
            fetch('/api/admin/toggle-chat')
                .then(res => res.json())
                .then(data => setAutoChatEnabled(data.enabled))
                .catch(err => console.error("Failed to fetch chat status", err));
        }
    }, [userRole]);

    const toggleAutoChat = async () => {
        try {
            const res = await fetch('/api/admin/toggle-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !autoChatEnabled })
            });
            const data = await res.json();
            if (data.success) {
                setAutoChatEnabled(!autoChatEnabled);
            }
        } catch (error) {
            console.error("Failed to toggle chat", error);
        }
    };

    if (status === 'loading' || loading) {
        return <div className="min-h-screen bg-[#1e2124] flex items-center justify-center text-white">Đang tải cộng đồng...</div>;
    }

    if (!session) return null; // Will redirect

    return (
        <div className="h-screen flex flex-col font-sans overflow-hidden bg-[#1e2124]">
            <Head>
                <title>SeenYT Hub - Cộng đồng Creator</title>
            </Head>

            <div className="flex-none">
                <Header />
            </div>

            <main className="flex-1 flex overflow-hidden relative">
                {/* LEFT Sidebar - Now with Admin Toggle */}
                <ChannelSidebar
                    channels={channels}
                    activeChannel={activeChannel}
                    onSelect={setActiveChannel}
                    userRole={userRole}
                    // Props for Admin Toggle
                    autoChatEnabled={autoChatEnabled}
                    toggleAutoChat={toggleAutoChat}
                />

                {/* CENTER Chat */}
                <ChatArea
                    channel={activeChannel}
                // Optional: Pass if ChatArea specifically needs to know status (e.g. for notifications)
                // But we removed the button from ChatArea, so currently it might not strictly need it 
                // unless we want to show a "BOT ON" banner. For now, Sidebar has the button.
                />

                {/* RIGHT Sidebar: Life Panel */}
                <LifePanel />
            </main>
        </div>
    );
}
