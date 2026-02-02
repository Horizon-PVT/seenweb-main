import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable standard body parsing to handle file streams
export const config = {
    api: {
        bodyParser: false,
    },
};

const uploadDir = path.join(process.cwd(), 'public/images/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
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

        // Formidable v3 returns an array of files for each key
        const file = files.file?.[0]; // Access the first file 

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Construct the public URL
        const fileName = path.basename(file.filepath);
        const fileUrl = `/images/uploads/${fileName}`;

        console.log('File uploaded to:', fileUrl);

        return res.status(200).json({ url: fileUrl });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Internal server error during upload' });
    }
}
