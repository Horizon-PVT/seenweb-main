
import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
    getCookie, setCookie, generateAnonId, ATTRIBUTION_COOKIE_NAME, ANON_ID_COOKIE_NAME,
    getAttributionFromUrl, AttributionData, UserAttributionPayload
} from '@/lib/attribution';
import { useRouter } from 'next/router';

export default function AttributionTracker() {
    const { data: session, status } = useSession();
    const router = useRouter();
    // Use ref to avoid double firing in React 18 strict mode potentially, though useEffect dependency handling is improved
    const viewTracked = useRef<string>('');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 1. Ensure Anon ID
        let anonId = getCookie(ANON_ID_COOKIE_NAME);
        if (!anonId) {
            anonId = generateAnonId();
            setCookie(ANON_ID_COOKIE_NAME, anonId, 365);
        }

        // 2. Capture Attribution from URL
        const currentAttr = getAttributionFromUrl();
        const hasAttrData = Object.keys(currentAttr).length > 0;

        if (hasAttrData) {
            // Read existing
            const existingJson = getCookie(ATTRIBUTION_COOKIE_NAME);
            let payload: UserAttributionPayload = existingJson
                ? JSON.parse(existingJson)
                : { anonId, firstTouch: null, lastTouch: null };

            // Update payload
            if (!payload.firstTouch || Object.keys(payload.firstTouch).length === 0) {
                payload.firstTouch = currentAttr as AttributionData;
            }
            payload.lastTouch = currentAttr as AttributionData;
            payload.anonId = anonId; // ensure sync

            setCookie(ATTRIBUTION_COOKIE_NAME, JSON.stringify(payload), 30);
        }

        // 3. Track Landing View / Page View
        const path = window.location.pathname;
        const shouldTrack = viewTracked.current !== path; // Simple dedupe for same path in session

        // Also track if 5 mins passed? We'll let server handle 5min dedupe. 
        // Client side just sends "landing_view" on meaningful navigation? 
        // The requirement says "landing_view" dedupe 5 min. 
        // We send it, server dedupes.

        // We only fire for interesting pages or all? "landing_view" implies entry.
        // Let's fire 'page_view' generally.

        if (shouldTrack) {
            viewTracked.current = path;

            const props: any = {
                title: document.title,
                referrer: document.referrer
            };
            // Attach UTMs if present in current URL (Landing view context)
            if (currentAttr.utmSource) props.utm_source = currentAttr.utmSource;
            if (currentAttr.utmMedium) props.utm_medium = currentAttr.utmMedium;
            if (currentAttr.utmCampaign) props.utm_campaign = currentAttr.utmCampaign;

            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'page_view',
                    anonId,
                    path,
                    properties: props
                })
            }).catch(() => { });
        }

    }, [router.asPath]);

    // 4. Attach to User if Authenticated
    useEffect(() => {
        if (status === 'authenticated') {
            const payloadJson = getCookie(ATTRIBUTION_COOKIE_NAME);
            const anonId = getCookie(ANON_ID_COOKIE_NAME);

            if (payloadJson || anonId) {
                fetch('/api/attribution/attach', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        payload: payloadJson ? JSON.parse(payloadJson) : null,
                        anonId
                    })
                }).catch(err => console.error("Attribution attach failed", err));
            }
        }
    }, [status]);

    return null;
}
