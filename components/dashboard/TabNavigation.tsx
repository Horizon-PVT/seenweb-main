// components/dashboard/TabNavigation.tsx
import React from 'react';
import { TABS, canAccessTab, type TabId } from '../../lib/tab-access';

interface TabNavigationProps {
    activeTab: TabId;
    onTabChange: (tabId: TabId) => void;
    userRole: string;
    onLockedTabClick: (tabId: TabId) => void;
}

export default function TabNavigation({
    activeTab,
    onTabChange,
    userRole,
    onLockedTabClick,
}: TabNavigationProps) {
    return (
        <div 
            className="flex overflow-x-auto gap-2 mb-6 bg-black/40 p-2 rounded-xl border border-gray-800"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            <style jsx>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            {TABS.map((tab) => {
                const isAccessible = canAccessTab(userRole, tab.id);
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            if (isAccessible) {
                                onTabChange(tab.id);
                            } else {
                                onLockedTabClick(tab.id);
                            }
                        }}
                        className={`
              flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0
              ${isActive
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                : isAccessible
                                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                    : 'bg-gray-900/50 text-gray-500 cursor-not-allowed opacity-60'
                            }
            `}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        <span>{tab.label}</span>
                        {!isAccessible && (
                            <span className="ml-1 text-xs">🔒</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
