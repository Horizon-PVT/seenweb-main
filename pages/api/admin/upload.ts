import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Disable standard body parsing to handle file streams
export const config = {
    api: {
        bodyParser: false,
    },
};

// Use public/images/uploads for local dev, /tmp on Vercel
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel
    ? os.tmpdir()
    : path.join(process.cwd(), 'public/images/uploads');

// Ensure upload directory exists (local dev only)
if (!isVercel && !fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const form = formidable({
            uploadDir: uploadDir,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            filename: (name, ext, part, form) => {
                const timestamp = Date.now();
                const originalName = part.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'image';
                return `${timestamp}-${originalName}`;
            }
        });

        const [fields, files] = await form.parse(req);

        const file = files.file?.[0];

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (isVercel) {
            // On Vercel: read file and return as base64 data URL
            // (Vercel's filesystem is ephemeral, so we can't serve from /tmp)
            const fileBuffer = fs.readFileSync(file.filepath);
            const base64 = fileBuffer.toString('base64');
            const mimeType = file.mimetype || 'image/jpeg';
            const dataUrl = `data:${mimeType};base64,${base64}`;

            // Clean up temp file
            try { fs.unlinkSync(file.filepath); } catch (e) { /* ignore */ }

            return res.status(200).json({ url: dataUrl });
        } else {
            // On local dev: serve from public directory
            const fileName = path.basename(file.filepath);
            const fileUrl = `/images/uploads/${fileName}`;

            console.log('File uploaded to:', fileUrl);
            return res.status(200).json({ url: fileUrl });
        }

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Internal server error during upload' });
    }
}
