import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';

interface AcademyLayoutProps {
    children: React.ReactNode;
}

export default function AcademyLayout({ children }: AcademyLayoutProps) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col font-sans text-gray-200">
            {/* Top Navigation Bar */}
            <Header />

            {/* Main Content Area (Full Width, No Sidebar) */}
            <main className="flex-1 w-full flex flex-col">
                {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Global Auth Modal for Free tier login or Pro upgrades */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
}
