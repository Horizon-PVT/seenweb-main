// components/WelcomePopupManager.tsx - Manages welcome popups after login
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import WelcomeSlotMachine from './WelcomeSlotMachine';
import SharePromoPopup from './SharePromoPopup';
import { useRouter } from 'next/router';

const WELCOME_SHOWN_KEY = 'seenyt_welcome_shown_v2'; // Changed key to reset for testing
const WELCOME_SHOWN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export default function WelcomePopupManager() {
    const { data: session, status } = useSession();
    const [showSlotMachine, setShowSlotMachine] = useState(false);
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

        // Force show if testing
        if (isTest) {
            console.log('WelcomePopupManager: Test mode active. Showing popup.');
            setShowSlotMachine(true);
            return;
        }

        // Only show for logged-in users
        if (status !== 'authenticated' || !session?.user) return;

        // Check if user is FREE tier (most likely to convert)
        const userRole = (session.user as any)?.role;
        // ENABLE FOR TESTING: Allow ADMIN to see it too
        if (userRole && userRole !== 'FREE' && userRole !== 'ADMIN') {
            console.log('WelcomePopupManager: User is not FREE/ADMIN. Skip.');
            return;
        }

        // Check if already shown in last 24h
        const lastShown = localStorage.getItem(WELCOME_SHOWN_KEY);
        if (lastShown) {
            const lastShownTime = parseInt(lastShown);
            if (Date.now() - lastShownTime < WELCOME_SHOWN_EXPIRY) {
                console.log('WelcomePopupManager: Already shown recently. Skip.');
                return; // Already shown recently
            }
        }

        // Show slot machine after a short delay (let page load first)
        const timer = setTimeout(() => {
            console.log('WelcomePopupManager: Showing popup!');
            setShowSlotMachine(true);
            localStorage.setItem(WELCOME_SHOWN_KEY, Date.now().toString());
        }, 1500);

        return () => clearTimeout(timer);
    }, [session, status, router.query]);

    const handleSlotMachineClose = () => {
        setShowSlotMachine(false);
    };

    const handleShowSharePopup = () => {
        setShowSlotMachine(false);
        setTimeout(() => setShowSharePopup(true), 300);
    };

    const handleSharePopupClose = () => {
        setShowSharePopup(false);
    };

    return (
        <>
            <WelcomeSlotMachine
                isOpen={showSlotMachine}
                onClose={handleSlotMachineClose}
                onShowSharePopup={handleShowSharePopup}
                userEmail={session?.user?.email || undefined}
            />
            <SharePromoPopup
                isOpen={showSharePopup}
                onClose={handleSharePopupClose}
            />
        </>
    );
}
