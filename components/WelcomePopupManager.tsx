// components/WelcomePopupManager.tsx - Manages Khai Xuân popup after login
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import KhaiXuanPopup from './KhaiXuanPopup';
import SharePromoPopup from './SharePromoPopup';
import { useRouter } from 'next/router';

const WELCOME_SHOWN_KEY = 'seenyt_khaixuan_2026'; // New key for Khai Xuân
const WELCOME_SHOWN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const KHAI_XUAN_END = new Date('2026-03-15T23:59:59+07:00').getTime(); // Kết thúc 15/3/2026

export default function WelcomePopupManager() {
    const { data: session, status } = useSession();
    const [showPopup, setShowPopup] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const isTest = router.query.test_popup === 'true';
        console.log('WelcomePopupManager: Checking...', { status, role: (session?.user as any)?.role, isTest });

        // Skip on tool pages to avoid navigation conflicts
        if (router.pathname.startsWith('/studio') || router.pathname.startsWith('/tools')) {
            console.log('WelcomePopupManager: Skipping on tool page.');
            return;
        }

        // Check if Khai Xuân has ended
        if (Date.now() > KHAI_XUAN_END && !isTest) {
            console.log('WelcomePopupManager: Khai Xuân 2026 has ended.');
            return;
        }

        // Force show if testing
        if (isTest) {
            console.log('WelcomePopupManager: Test mode active. Showing popup.');
            setShowPopup(true);
            return;
        }

        // Only show for logged-in users
        if (status !== 'authenticated' || !session?.user) return;

        // Show for ALL tiers (FREE, BASIC, PRO, ADMIN)
        const userRole = (session.user as any)?.role;
        console.log('WelcomePopupManager: User role:', userRole);

        // Check if already shown in last 24h
        const lastShown = localStorage.getItem(WELCOME_SHOWN_KEY);
        if (lastShown) {
            const lastShownTime = parseInt(lastShown);
            if (Date.now() - lastShownTime < WELCOME_SHOWN_EXPIRY) {
                console.log('WelcomePopupManager: Already shown recently. Skip.');
                return; // Already shown recently
            }
        }

        // Show popup after a short delay (let page load first)
        const timer = setTimeout(() => {
            console.log('WelcomePopupManager: Showing Khai Xuân popup!');
            setShowPopup(true);
            localStorage.setItem(WELCOME_SHOWN_KEY, Date.now().toString());
        }, 1500);

        return () => clearTimeout(timer);
    }, [session, status, router.query]);

    const handlePopupClose = () => {
        setShowPopup(false);
    };

    const handleShowSharePopup = () => {
        setShowPopup(false);
        setTimeout(() => setShowSharePopup(true), 300);
    };

    const handleSharePopupClose = () => {
        setShowSharePopup(false);
    };

    const userRole = (session?.user as any)?.role || 'FREE';

    return (
        <>
            <KhaiXuanPopup
                isOpen={showPopup}
                onClose={handlePopupClose}
                onShowSharePopup={handleShowSharePopup}
                userEmail={session?.user?.email || undefined}
                userRole={userRole}
            />
            <SharePromoPopup
                isOpen={showSharePopup}
                onClose={handleSharePopupClose}
            />
        </>
    );
}
