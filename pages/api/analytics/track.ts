
import type { NextApiRequest, NextApiResponse } from 'next';
import { trackEvent } from '@/lib/analytics';
import { getCookie } from 'cookies-next'; // Just in case, but we pass headers usually
// Or just rely on body

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const { name, anonId, path, properties } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing event name' });

    // Optional: get userId from session if available, likely handled by middleware or next-auth
    // But this is a public endpoint. We'll try to check session but avoid overhead if strict public performance needed.
    // Actually, we can just pass anonId. If logged in, the attach logic links anonId to userId anyway.

    await trackEvent(name, null, anonId, properties, path);

    res.status(200).json({ ok: true });
}
