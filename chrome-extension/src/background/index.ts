// Background Service Worker
// @ts-nocheck
console.log('[SeenYT] Background script loaded.');

// Listen for installation
declare var chrome: any;
chrome.runtime.onInstalled.addListener(() => {
    console.log('[SeenYT] Extension installed successfully!');
});

// Listener for messages from Content Script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.type === 'SEENYT_BG_FETCH') {
        const { url, options } = request;
        console.log('[SeenYT-BG] Fetching:', url);

        const fetchOptions = {
            ...options,
            cache: 'no-cache' // Force network request
        };

        fetch(url, fetchOptions)
            .then(async response => {
                const text = await response.text();
                console.log(`[SeenYT-BG] Status: ${response.status}, Length: ${text.length}`);
                return {
                    ok: response.ok,
                    status: response.status,
                    text: text
                };
            })
            .then(data => {
                sendResponse(data);
            })
            .catch(error => {
                console.error('[SeenYT-BG] Error:', error);
                sendResponse({ ok: false, error: String(error) });
            });

        return true; // Keep channel open for async response
    }
});
