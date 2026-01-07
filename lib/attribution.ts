
export const ATTRIBUTION_COOKIE_NAME = 'seen_attribution';
export const ANON_ID_COOKIE_NAME = 'seen_anon_id';

export interface AttributionData {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    gclid?: string;
    referrer?: string;
    landingPath?: string;
    seenAt: string; // ISO date
}

export interface UserAttributionPayload {
    anonId: string;
    firstTouch: AttributionData | null;
    lastTouch: AttributionData | null;
}

// Client-side helper to get/set cookie
export function setCookie(name: string, value: string, days = 30) {
    if (typeof document === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
}

export function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function generateAnonId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function getAttributionFromUrl(): Partial<AttributionData> {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);

    // Only capture if at least one interesting param exists
    const interesting = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid'];
    const hasInteresting = interesting.some(k => params.has(k));

    if (!hasInteresting) return {};

    return {
        utmSource: params.get('utm_source') || undefined,
        utmMedium: params.get('utm_medium') || undefined,
        utmCampaign: params.get('utm_campaign') || undefined,
        utmTerm: params.get('utm_term') || undefined,
        utmContent: params.get('utm_content') || undefined,
        gclid: params.get('gclid') || undefined,
        referrer: document.referrer || undefined,
        landingPath: window.location.pathname,
        seenAt: new Date().toISOString(),
    };
}
