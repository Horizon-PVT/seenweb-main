// Background Service Worker
console.log('[SeenYT] Background script loaded.');

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('[SeenYT] Extension installed successfully!');
});

// Listener for messages from Content Script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.type === 'SEENYT_BG_FETCH') {
        const { url, options } = request;
        console.log('[SeenYT-BG] Fetching:', url);

        // Force credentials to include cookies
        const fetchOptions = {
            ...options,
            credentials: 'include' as RequestCredentials
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
