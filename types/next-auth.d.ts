// types/next-auth.d.ts
// Type extensions for next-auth session

import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            role?: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: string;
        membershipExpiry?: Date | null;
        maxDailyUsage?: number;
    }
}
