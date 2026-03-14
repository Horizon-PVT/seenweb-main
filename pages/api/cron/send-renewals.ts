import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { sendRenewalReminderEmail } from '@/lib/email';
import { differenceInDays, startOfDay, endOfDay, addDays } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Basic security for cron endpoints
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;
    
    // Only verify if CRON_SECRET is configured. It's recommended to configure this string in Vercel/env.
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ success: false, message: 'Unauthorized execution' });
    }

    try {
        const today = new Date();
        const maxDateCheck = addDays(today, 5); // Tính tới 5 ngày tới
        const endOfMaxDate = endOfDay(maxDateCheck);
        
        // Find users with membership soon to expire, not already expired, and whose role isn't FREE/None
        // we'll get users whose expiry is > now and <= now + 5 days
        const expiringUsers = await prisma.user.findMany({
            where: {
                role: { not: 'FREE' },
                membershipExpiry: {
                    gt: new Date(),
                    lte: endOfMaxDate
                }
            },
            select: {
                id: true,
                email: true,
                name: true,
                membershipExpiry: true,
                role: true
            }
        });

        const results = [];

        for (const user of expiringUsers) {
            if (user.membershipExpiry) {
                // Determine exactly how many days are left
                // For instance if the expiry is tomorrow, we get 1.
                // differenceInDays rounds down to the integer difference
                const baseDiff = differenceInDays(startOfDay(new Date(user.membershipExpiry)), startOfDay(today));
                // If it's expiring today later, differenceInDays of startOfDay is 0
                const daysLeft = baseDiff >= 0 ? baseDiff : 0;
                
                // Only send if <= 5 days (just double check)
                if (daysLeft <= 5) {
                    const sent = await sendRenewalReminderEmail(user.email, user.name || undefined, daysLeft);
                    
                    results.push({
                        email: user.email,
                        daysLeft,
                        sent
                    });
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: `Processed ${results.length} renewal reminders.`,
            details: results
        });
        
    } catch (error: any) {
        console.error("Error in send-renewals cron job:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error executing cron job', 
            error: error.message 
        });
    }
}
