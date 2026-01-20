/**
 * SeenYT Content Script Loader
 * Handles dynamic import of ES Modules for Chrome Extension
 */
(async () => {
    try {
        const src = chrome.runtime.getURL('assets/content.js');
        console.log('[SeenYT] Loader injecting module:', src);
        await import(src);
    } catch (err) {
        console.error('[SeenYT] Loader failed import:', err);
    }
})();
