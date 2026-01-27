// Background script - Auto open Flow + Side Panel

const FLOW_URL = 'https://labs.google/fx/tools/flow';
const FLOW_KEYWORD = 'labs.google';

// Enable side panel to open on action click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.error('[Kodaflow] Panel behavior error:', err));

// When icon is clicked - open Flow if not there, then open side panel
chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;

    // Check if already on Flow
    if (tab.url && tab.url.includes(FLOW_KEYWORD)) {
        // Already on Flow, just open the panel
        chrome.sidePanel.open({ tabId: tab.id });
    } else {
        // Navigate to Flow and open panel
        await chrome.tabs.update(tab.id, { url: FLOW_URL });
        // Wait for page load then open panel
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tab.id && info.status === 'complete') {
                chrome.sidePanel.open({ tabId: tabId });
                chrome.tabs.onUpdated.removeListener(listener);
            }
        });
    }
});

// Relay messages from panel to content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_AUTOMATION' || message.type === 'STOP_AUTOMATION') {
        // Send to active tab's content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, message)
                    .then(response => sendResponse(response))
                    .catch(err => {
                        console.error('[Kodaflow] Failed to send to content script:', err);
                        sendResponse({ status: 'error', message: 'Content script not ready' });
                    });
            }
        });
        return true; // Keep channel open for async response
    }

    // Relay status updates to panel
    if (message.action === 'updateStatus' || message.action === 'batchCompleted') {
        // Forward to panel (runtime)
        chrome.runtime.sendMessage(message).catch(() => { });
    }
});

console.log("[Kodaflow] Background service worker started.");
