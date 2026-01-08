import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const tempDir = os.tmpdir();

    // Check if we need to clean up old files? 
    // For now, let OS handle tmp cleanup or implement a cron later.

    const form = formidable({
        keepExtensions: false,
        maxFileSize: 10 * 1024 * 1024, // 10MB per chunk is ample
    });

    try {
        const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        const uploadId = Array.isArray(fields.uploadId) ? fields.uploadId[0] : fields.uploadId;
        const chunkIndex = parseInt(Array.isArray(fields.chunkIndex) ? fields.chunkIndex[0] : fields.chunkIndex || '0');
        const chunkFile = Array.isArray(files.chunk) ? files.chunk[0] : files.chunk;

        if (!uploadId || !chunkFile) {
            return res.status(400).json({ error: 'Missing uploadId or chunk file' });
        }

        const filePath = path.join(tempDir, `upload_${uploadId}`);

        // Read chunk and append to file
        const chunkData = fs.readFileSync(chunkFile.filepath);

        // If it's the first chunk, ensure we start fresh (or overwrite) 
        // But since calls might be parallel (though we should do sequential), append is safer if controlled.
        // We will assume sequential upload from client.
        if (chunkIndex === 0) {
            fs.writeFileSync(filePath, chunkData);
        } else {
            fs.appendFileSync(filePath, chunkData);
        }

        // Cleanup chunk temp file
        try { fs.unlinkSync(chunkFile.filepath); } catch { }

        res.status(200).json({ ok: true });

    } catch (error: any) {
        console.error('Chunk Upload Error:', error);
        res.status(500).json({ error: error.message });
    }
}
