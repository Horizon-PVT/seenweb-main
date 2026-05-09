// pages/api/user/upload-avatar.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.email) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Parse multipart form data manually
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
            chunks.push(Buffer.from(chunk));
        }
        const buffer = Buffer.concat(chunks);

        // Get content-type and boundary
        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : null;

        if (!boundary) {
            return res.status(400).json({ success: false, message: 'Invalid form data' });
        }

        // Parse multipart data
        const parts = buffer.toString('binary').split(`--${boundary}`);
        let fileData: { name: string; type: string; data: Buffer } | null = null;

        for (const part of parts) {
            if (part.includes('filename="') && part.includes('Content-Type:')) {
                const headerEnd = part.indexOf('\r\n\r\n');
                const header = part.substring(0, headerEnd);
                const content = part.substring(headerEnd + 4, part.length - 2);

                const filenameMatch = header.match(/filename="([^"]+)"/);
                const typeMatch = header.match(/Content-Type: ([^\r\n]+)/);
                const nameMatch = header.match(/name="([^"]+)"/);

                if (filenameMatch && typeMatch && nameMatch && nameMatch[1] === 'avatar') {
                    fileData = {
                        name: filenameMatch[1],
                        type: typeMatch[1],
                        data: Buffer.from(content, 'binary'),
                    };
                    break;
                }
            }
        }

        if (!fileData) {
            return res.status(400).json({ success: false, message: 'No avatar file provided' });
        }

        // Validate file type
        if (!fileData.type.startsWith('image/')) {
            return res.status(400).json({ success: false, message: 'Only image files are allowed' });
        }

        // Validate file size (max 2MB)
        if (fileData.data.length > 2 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: 'File size must be less than 2MB' });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const fileExt = fileData.name.split('.').pop() || 'jpg';
        const sanitizedEmail = session.user.email.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${sanitizedEmail}_${Date.now()}.${fileExt}`;
        const filePath = path.join(uploadsDir, fileName);

        // Save file
        await writeFile(filePath, fileData.data);

        const imageUrl = `/uploads/avatars/${fileName}`;

        return res.status(200).json({
            success: true,
            imageUrl,
            message: 'Avatar uploaded successfully',
        });
    } catch (error) {
        console.error('Upload avatar error:', error);
        return res.status(500).json({ success: false, message: 'Failed to upload avatar' });
    }
}
