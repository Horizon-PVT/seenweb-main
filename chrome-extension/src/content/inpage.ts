// This script runs in the MAIN world (injected into the page)
// It has FULL access to YouTube's internal APIs and context

(function () {
    console.log('[SeenYT] In-page script v2 loaded');

    window.addEventListener('message', async function (event) {
        if (!event.data) return;

        // Handler: Complete Transcript Extraction (All-in-One)
        if (event.data.type === 'SEENYT_GET_FULL_TRANSCRIPT') {
            const { requestId, videoId } = event.data;
            let transcript = '';
            let segments: Array<{ time: string, text: string }> = [];
            let error = null;
            let debugInfo: any = {};

            try {
                console.log('[SeenYT] Starting full transcript extraction for:', videoId);

                // Step 1: Get Player Data
                let playerData = null;

                // Try Global Variable First
                // @ts-ignore
                const globalData = window.ytInitialPlayerResponse;
                if (globalData && globalData.videoDetails && globalData.videoDetails.videoId === videoId) {
                    console.log('[SeenYT] Using global ytInitialPlayerResponse');
                    playerData = globalData;
                    debugInfo.source = 'global';
                } else {
                    // Try Internal API
                    console.log('[SeenYT] Fetching via internal API...');
                    // @ts-ignore
                    const ytcfg = window.ytcfg;
                    if (ytcfg && ytcfg.get) {
                        const apiKey = ytcfg.get('INNERTUBE_API_KEY');
                        const context = ytcfg.get('INNERTUBE_CONTEXT');

                        if (apiKey && context) {
                            const response = await fetch(`/youtubei/v1/player?key=${apiKey}&prettyPrint=false`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ context, videoId })
                            });
                            playerData = await response.json();
                            debugInfo.source = 'api';
                            console.log('[SeenYT] API response received');
                        } else {
                            debugInfo.apiError = 'No apiKey or context';
                        }
                    } else {
                        debugInfo.apiError = 'No ytcfg';
                    }
                }

                if (!playerData) {
                    error = 'Could not get player data';
                    debugInfo.playerData = null;
                } else {
                    debugInfo.playerData = 'ok';

                    // Step 2: Extract Caption Tracks
                    const captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
                    debugInfo.hasCaptions = !!captionTracks;
                    if (captionTracks && captionTracks.length > 0) {
                        debugInfo.captionTracksCount = captionTracks.length;
                        console.log('[SeenYT] Found', captionTracks.length, 'caption tracks');

                        // Prefer Vietnamese, fallback to first available
                        const track = captionTracks.find((t: any) => t.languageCode === 'vi') || captionTracks[0];
                        debugInfo.selectedLang = track.languageCode;

                        console.log('[SeenYT] Selected track:', track.languageCode);

                        // Step 3: Fetch via Backend API (bypasses CORS!)
                        let transcriptText = '';

                        try {
                            console.log('[SeenYT] Fetching via backend API...');
                            const apiUrl = `https://seenyt.net/api/youtube/transcript?videoId=${videoId}`;
                            const apiRes = await fetch(apiUrl);
                            debugInfo.apiStatus = apiRes.status;

                            if (apiRes.ok) {
                                const apiData = await apiRes.json();
                                console.log('[SeenYT] API response:', apiData);

                                if (apiData.success && apiData.segments) {
                                    segments = apiData.segments;
                                    transcriptText = apiData.transcript;
                                    debugInfo.format = 'backend-api';
                                    debugInfo.segmentCount = segments.length;
                                    debugInfo.keywords = apiData.keywords;
                                    debugInfo.sentiment = apiData.sentiment;
                                    console.log('[SeenYT] ✅ Backend API success:', segments.length, 'segments');
                                } else {
                                    debugInfo.apiError = apiData.error || 'No data';
                                }
                            } else {
                                debugInfo.apiError = `HTTP ${apiRes.status}`;
                            }
                        } catch (apiErr) {
                            console.error('[SeenYT] Backend API failed:', apiErr);
                            debugInfo.apiError = String(apiErr);
                        }

                        transcript = transcriptText;
                        debugInfo.transcriptLength = transcript.length;
                    } else {
                        error = 'No caption tracks available';
                    }
                }

            } catch (e) {
                console.error('[SeenYT] Full extraction failed:', e);
                error = String(e);
                debugInfo.exception = String(e);
            }

            console.log('[SeenYT] Extraction complete. Debug:', JSON.stringify(debugInfo));

            window.postMessage({
                type: 'SEENYT_FULL_TRANSCRIPT_RESULT',
                requestId: requestId,
                transcript: transcript,
                segments: segments,
                keywords: debugInfo.keywords || [],
                sentiment: debugInfo.sentiment || 'neutral',
                error: error || (transcript ? null : 'Unknown error - no transcript extracted'),
                debug: debugInfo
            }, '*');
        }
    });

    // Notify content script that we are ready
    window.postMessage({ type: 'SEENYT_INPAGE_READY' }, '*');
})();
