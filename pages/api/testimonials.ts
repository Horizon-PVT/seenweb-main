import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const dirPath = path.join(process.cwd(), 'public', 'images', 'testimonials');

        // Ensure directory exists
        if (!fs.existsSync(dirPath)) {
            return res.status(200).json([]);
        }

        const files = fs.readdirSync(dirPath);

        // Filter out non-images and sort alphabetically for consistent order
        const imageFiles = files
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .sort();

        // Convert to absolute static paths
        const imageUrls = imageFiles.map(file => `/images/testimonials/${file}`);

        res.status(200).json(imageUrls);
    } catch (error) {
        console.error('Failed to read testimonials directory:', error);
        res.status(500).json({ error: 'Failed to read directory' });
    }
}
