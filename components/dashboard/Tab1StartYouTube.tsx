// components/dashboard/Tab1StartYouTube.tsx
// 3-step flow for beginners with i18n support
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { hasMinRole } from '../../lib/tab-access';
import LockedFeatureModal from './LockedFeatureModal';

interface Tab1Props {
    onOpenTool: (toolId: string) => void;
}

export default function Tab1StartYouTube({ onOpenTool }: Tab1Props) {
    const { data: session } = useSession();
    const { t } = useTranslation('common');
    const userRole = (session?.user as any)?.role || 'FREE';
    const isFreeUser = !hasMinRole(userRole, 'CREATIVE');

    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const STEPS = [
        {
            step: 1,
            title: t('dashboard_tabs.step1_title'),
            description: t('dashboard_tabs.step1_desc'),
            toolId: 'micro-niche-miner',
            icon: '🎯',
            color: 'from-blue-500 to-cyan-400',
            cta: t('dashboard_tabs.step1_cta'),
            freeAccess: true,
        },
        {
            step: 2,
            title: t('dashboard_tabs.step2_title'),
            description: t('dashboard_tabs.step2_desc'),
            toolId: 'scriptwriter',
            icon: '✍️',
            color: 'from-purple-500 to-pink-500',
            cta: t('dashboard_tabs.step2_cta'),
            freeAccess: false,
        },
        {
            step: 3,
            title: t('dashboard_tabs.step3_title'),
            description: t('dashboard_tabs.step3_desc'),
            toolId: 'seo',
            icon: '🚀',
            color: 'from-amber-400 to-orange-500',
            cta: t('dashboard_tabs.step3_cta'),
            freeAccess: false,
        },
    ];

    const handleStepClick = (step: typeof STEPS[0]) => {
        if (isFreeUser && !step.freeAccess) {
            setModalMessage(
                step.step === 2
                    ? t('dashboard_tabs.upgrade_script')
                    : t('dashboard_tabs.upgrade_seo')
            );
            setShowModal(true);
            return;
        }
        onOpenTool(step.toolId);
    };

    return (
        <div className="space-y-6">
            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STEPS.map((step) => {
                    const isLocked = isFreeUser && !step.freeAccess;

                    return (
                        <div
                            key={step.step}
                            className={`
                relative p-6 rounded-2xl border transition-all duration-300
                ${isLocked
                                    ? 'bg-gray-900/30 border-gray-700/50 opacity-80'
                                    : 'bg-gray-900/50 border-gray-700 hover:border-purple-500/50 hover:-translate-y-1'
                                }
              `}
                        >
                            {/* Step Badge */}
                            <div className="absolute top-4 right-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {t('dashboard_tabs.step')} {step.step}
                            </div>

                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                                {step.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-gray-400 text-sm mb-6 min-h-[48px]">{step.description}</p>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleStepClick(step)}
                                className={`
                  w-full py-3 px-4 rounded-xl font-medium transition-all duration-300
                  ${isLocked
                                        ? 'bg-gray-800 text-gray-400 flex items-center justify-center gap-2'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                                    }
                `}
                            >
                                {isLocked && <span>🔒</span>}
                                {step.cta}
                            </button>

                            {/* FREE indicator */}
                            {step.freeAccess && isFreeUser && (
                                <p className="text-xs text-green-400 text-center mt-2">
                                    {t('dashboard_tabs.free_daily')}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress hint for FREE users */}
            {isFreeUser && (
                <div className="text-center p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                    <p className="text-purple-300 text-sm">
                        💡 <strong>{t('dashboard_tabs.tip')}</strong> {t('dashboard_tabs.tip_text')}
                    </p>
                </div>
            )}

            {/* Upsell Modal */}
            <LockedFeatureModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={t('dashboard_tabs.unlock_title')}
                message={modalMessage}
            />
        </div>
    );
}
