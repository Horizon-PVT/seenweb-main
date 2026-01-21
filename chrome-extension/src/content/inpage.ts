// This script runs in the MAIN world (injected into the page)
// It has FULL access to YouTube's internal APIs and context

(function () {
    console.log('[SeenYT] In-page script v6 loaded (Cleaned up)');

    window.addEventListener('message', async function (event) {
        if (!event.data) return;

        if (event.data.type === 'SEENYT_GET_FULL_TRANSCRIPT') {
            // Feature temporarily disabled due to YouTube blocking
            window.postMessage({
                type: 'SEENYT_FULL_TRANSCRIPT_RESULT',
                requestId: event.data.requestId,
                transcript: '',
                segments: [],
                error: 'Transcript feature temporarily disabled',
                debug: { status: 'disabled' }
            }, '*');
        }
    });

    window.postMessage({ type: 'SEENYT_INPAGE_READY' }, '*');
})();
