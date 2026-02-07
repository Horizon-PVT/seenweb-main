import { createRoot } from 'react-dom/client';
import Widget from './Widget';
import ChannelWidget from './ChannelWidget';
import StudioWidget from './StudioWidget';
// @ts-ignore
import styles from '../index.css?inline';
// Create a style element for Tailwind/Custom CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

const VIDEO_WIDGET_ID = 'seenyt-video-widget';
const CHANNEL_WIDGET_ID = 'seenyt-channel-widget';

// ========== DASHBOARD BRIDGE ==========
function runDashboardBridge() {
    console.log('[SeenYT] Dashboard Bridge Active');

    // Listen for messages from the web page
    window.addEventListener('message', async (event) => {
        // We accept messages from seenyt.net or localhost
        if (event.source !== window) return; // Only accept same-window messages for security if using postMessage wrapper, BUT
        // If the web page sends postMessage, source is window.

        if (event.data?.type === 'SEENYT_GET_TRANSCRIPT') {
            const { videoId } = event.data;
            console.log('[SeenYT] Bridge received request for:', videoId);

            try {
                const result = await chrome.storage.local.get(`transcript_${videoId}`);
                const data = result[`transcript_${videoId}`];

                if (data) {
                    window.postMessage({
                        type: 'SEENYT_TRANSCRIPT_RESULT',
                        videoId,
                        transcript: data.transcript,
                        error: null
                    }, '*');
                } else {
                    window.postMessage({
                        type: 'SEENYT_TRANSCRIPT_RESULT',
                        videoId,
                        transcript: null,
                        error: 'Transcript not found in extension storage'
                    }, '*');
                }
            } catch (e: any) {
                window.postMessage({
                    type: 'SEENYT_TRANSCRIPT_RESULT',
                    videoId,
                    transcript: null,
                    error: e.message
                }, '*');
            }
        }
    });
}

// ========== AUTH SYNC BRIDGE ==========
function runAuthSync() {
    // Only run on seenyt.net
    if (!window.location.host.includes('seenyt.net')) return;

    console.log('[SeenYT] Auth Sync Active');

    // Poll for localStorage changes (set by extension-callback.tsx)
    const checkAuth = () => {
        const email = localStorage.getItem('seenyt_email');
        if (email) {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get(['seenyt_email'], (result: Record<string, any>) => {
                    if (result.seenyt_email !== email) {
                        chrome.storage.local.set({ seenyt_email: email }, () => {
                            console.log('[SeenYT] Synced new email to extension:', email);
                        });
                    }
                });
            }
        }
    };

    setInterval(checkAuth, 2000);
}

// Run Auth Sync
if (window.location.host.includes('seenyt.net')) {
    runAuthSync();
}

function getPageType() {
    const url = window.location.href;
    if (url.includes('seenyt.net') && url.includes('dashboard')) return 'dashboard';
    if (url.includes('localhost') && url.includes('dashboard')) return 'dashboard';

    if (url.includes('studio.youtube.com')) return 'studio';
    if (url.includes('/watch?v=')) return 'video';
    if (url.includes('/@') || url.includes('/channel/') || url.includes('/c/')) return 'channel';
    return 'other';
}

// Check for dashboard immediately
if (getPageType() === 'dashboard') {
    runDashboardBridge();
}


// ========== VIDEO PAGE INJECTION ==========
function injectVideoWidget() {
    if (getPageType() !== 'video') return;

    // Check if already injected
    if (document.getElementById(VIDEO_WIDGET_ID)) return;

    // Target the secondary column (Sidebar) or below Description
    // YouTube's DOM changes often, so we try a few reliable targets
    const targetSelectors = [
        '#secondary-inner', // Right sidebar (Desktop)
        '#columns #secondary', // Right sidebar alt
        '#below', // Below video player
        'ytd-watch-metadata', // Metadata area
    ];

    let targetElement = null;
    for (const selector of targetSelectors) {
        const el = document.querySelector(selector);
        if (el) {
            targetElement = el;
            console.log(`[SeenYT] Found video target: ${selector}`);
            break;
        }
    }

    if (!targetElement) return;

    const container = document.createElement('div');
    container.id = VIDEO_WIDGET_ID;
    container.style.cssText = `display: block; width: 100%; margin-bottom: 12px; z-index: 99999; position: relative;`;

    if (targetElement.firstChild) {
        targetElement.insertBefore(container, targetElement.firstChild);
    } else {
        targetElement.appendChild(container);
    }

    try {
        const root = createRoot(container);
        root.render(<Widget />);
        console.log('[SeenYT] Video Widget injected successfully');
    } catch (error) {
        console.error('[SeenYT] Video Widget render error:', error);
    }
}

// ========== CHANNEL PAGE INJECTION ==========
function injectChannelWidget() {
    if (getPageType() !== 'channel') return;
    if (document.getElementById(CHANNEL_WIDGET_ID)) return;

    // Target: Insert AFTER the tabs bar and BEFORE the video content
    // This positions it exactly where the user wants (below tabs, above videos)

    const insertionTargets = [
        '#contents.ytd-two-column-browse-results-renderer', // Main content area
        '#contents.ytd-section-list-renderer', // Section content
        'ytd-rich-grid-renderer', // Video grid
        '#primary > #primary-inner' // Primary inner
    ];

    for (const selector of insertionTargets) {
        const target = document.querySelector(selector);
        if (target && target.parentNode) {
            const container = document.createElement('div');
            container.id = CHANNEL_WIDGET_ID;
            container.style.cssText = `
                display: block;
                width: 100%;
                padding: 12px 24px;
                background: transparent;
                z-index: 100;
            `;

            // Insert BEFORE the content (so it appears after tabs but before videos)
            target.parentNode.insertBefore(container, target);
            console.log(`[SeenYT] Channel widget injected before: ${selector}`);

            try {
                const root = createRoot(container);
                root.render(<ChannelWidget />);
            } catch (error) {
                console.error('[SeenYT] Render error:', error);
            }
            return;
        }
    }

    // Fallback: Append to tabs container
    const tabsContainer = document.querySelector('#tabs-inner-container, #tabsContent');
    if (tabsContainer) {
        const container = document.createElement('div');
        container.id = CHANNEL_WIDGET_ID;
        container.style.cssText = `display: block; width: 100%; margin-top: 8px; padding: 0 24px;`;
        tabsContainer.appendChild(container);
        try {
            const root = createRoot(container);
            root.render(<ChannelWidget />);
            console.log('[SeenYT] Channel widget appended to tabs');
        } catch (e) { console.error(e); }
    }
}

// ========== STUDIO PAGE INJECTION ==========
const STUDIO_WIDGET_ID = 'seenyt-studio-widget';

function injectStudioWidget() {
    if (getPageType() !== 'studio') return;
    if (document.getElementById(STUDIO_WIDGET_ID)) return;

    const container = document.createElement('div');
    container.id = STUDIO_WIDGET_ID;
    container.style.cssText = 'position: fixed; top: 80px; right: 16px; z-index: 9999;';
    document.body.appendChild(container);

    try {
        const root = createRoot(container);
        root.render(<StudioWidget />);
        console.log('[SeenYT] Studio widget injected');
    } catch (e) {
        console.error('[SeenYT] Studio injection error:', e);
    }
}

// ========== OBSERVER & INIT ==========
const observer = new MutationObserver(() => {
    if (getPageType() === 'video') injectVideoWidget();
    if (getPageType() === 'channel') injectChannelWidget();
    if (getPageType() === 'studio') injectStudioWidget();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial run - try immediately and again after delays
function runInjections() {
    if (getPageType() === 'video') injectVideoWidget();
    if (getPageType() === 'channel') injectChannelWidget();
    if (getPageType() === 'studio') injectStudioWidget();
}

// Run immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    runInjections();
} else {
    document.addEventListener('DOMContentLoaded', runInjections);
}

// Also try after short delays for YouTube's slow loading
setTimeout(runInjections, 500);
setTimeout(runInjections, 1500);
setTimeout(runInjections, 3000);

// Handle YouTube's SPA navigation events
window.addEventListener('yt-navigate-finish', () => {
    // Remove old widget first
    const oldWidget = document.getElementById(VIDEO_WIDGET_ID);
    if (oldWidget) oldWidget.remove();

    setTimeout(runInjections, 500);
    setTimeout(runInjections, 1500);
});

// ========== PROXY FETCH BRIDGE ==========
// Listen for fetch requests from inpage.js (Main World)
window.addEventListener('message', async (event) => {
    if (event.source !== window) return;

    if (event.data?.type === 'SEENYT_content_FETCH_REQUEST') {
        const { requestId, url, options } = event.data;
        console.log('[SeenYT-Bridge] Proxying fetch for:', url);

        try {
            // Forward to Background Script
            const response = await chrome.runtime.sendMessage({
                type: 'SEENYT_BG_FETCH',
                url,
                options
            });

            // Send result back to inpage.js
            window.postMessage({
                type: 'SEENYT_content_FETCH_RESULT',
                requestId,
                success: response.ok,
                status: response.status,
                text: response.text,
                error: response.error
            }, '*');
        } catch (e: any) {
            console.error('[SeenYT-Bridge] Error:', e);
            window.postMessage({
                type: 'SEENYT_content_FETCH_RESULT',
                requestId,
                success: false,
                error: e.message
            }, '*');
        }
    }
});
