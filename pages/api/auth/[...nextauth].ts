// File: pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { trackEvent } from "@/lib/analytics";

console.log("[DEBUG] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("[DEBUG] GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Set" : "Missing");
console.log("[DEBUG] NODE_ENV:", process.env.NODE_ENV);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  // Google-only
  pages: {
    signIn: "/",
    error: "/",
    newUser: "/welcome",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true; // Allow credentials login
      if (!user?.email) return false;

      try {
        // Normalize email to lowercase for consistent matching
        const normalizedEmail = user.email.toLowerCase();

        // Case-insensitive email lookup
        const existingUser = await prisma.user.findFirst({
          where: {
            email: {
              equals: normalizedEmail,
              mode: 'insensitive'
            }
          },
          select: { id: true },
        });

        // Calculate token expiry (approx 1 hour)
        const tokenExpiry = new Date();
        tokenExpiry.setSeconds(tokenExpiry.getSeconds() + (account.expires_at || 3599));

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: normalizedEmail, // Always store lowercase email
              name: user.name || null,
              image: user.image || null,
              role: "FREE",
              dailyUsage: 0,
              maxDailyUsage: 3,
              membershipExpiry: null,

              referrerId: null,
              affiliateCode: null,
              isAffiliate: false,
              totalCommission: new Prisma.Decimal(0),
            },
          });

          await trackEvent('auth_signup_success', newUser.id);
        } else {
          // Existing user login
          await trackEvent('auth_login_success', existingUser.id);
        }


        return true;
      } catch (e: any) {
        console.error("NextAuth signIn error DETAILED:", e.message, e.stack);
        return false;
      }
    },

    // QUAN TRỌNG: KHÔNG return baseUrl cứng kiểu "return baseUrl" cho mọi case.
    // Nếu anh ép vậy thì callbackUrl "/welcome" sẽ không bao giờ chạy đúng.
    async redirect({ url, baseUrl }) {
      // Cho phép redirect ngang hàng trên Localhost Subdomains
      if (url.includes(".localhost") || url.includes("localhost:3000")) return url;
      // Cho phép redirect ngang hàng trên Production Subdomains
      if (url.includes(".seenyt.net") || url === "https://seenyt.net") return url;

      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },

    async jwt({ token }) {
      if (token.email) {
        try {
          // Normalize email for case-insensitive lookup
          const normalizedEmail = (token.email as string).toLowerCase();

          const dbUser = await prisma.user.findFirst({
            where: {
              email: {
                equals: normalizedEmail,
                mode: 'insensitive'
              }
            },
            select: {
              id: true,
              role: true,
              membershipExpiry: true,
              maxDailyUsage: true,
              hasMasterclass: true,
            },
          });

          if (dbUser) {
            // Check if membership is expired (and not ADMIN)
            let effectiveRole = dbUser.role;
            const now = new Date();
            const isAdmin = dbUser.role === 'ADMIN';

            if (!isAdmin && dbUser.membershipExpiry && new Date(dbUser.membershipExpiry) < now) {
                // EXPIRED! Demote to FREE in this session.
                effectiveRole = 'FREE';
            }

            // Log role change if needed, or just current role
            if (token.role !== effectiveRole) {
              console.log(`[NextAuth] Role refreshed for ${token.email}: ${token.role} -> ${effectiveRole}`);
            }

            token.id = dbUser.id;
            token.role = effectiveRole;
            token.membershipExpiry = dbUser.membershipExpiry;
            // Also clamp usage if expired
            token.maxDailyUsage = effectiveRole === 'FREE' ? 3 : dbUser.maxDailyUsage;
            token.hasMasterclass = dbUser.hasMasterclass;
          }
        } catch (e) {
          console.error("jwt callback error:", e);
        }
      }
      return token;
    },

    async session({ session, token }) {
      // tuỳ type dự án anh, nếu TS báo lỗi session.user.id thì anh đã có custom type ở next-auth.d.ts
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      (session.user as any).hasMasterclass = token.hasMasterclass;
      return session;
    },
  },

  session: { strategy: "jwt" },

  // Enable Cross-Domain Session for NextAuth in Production Only
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // This is the Magic: allow subdomains to access the cookie. Only valid in production.
        ...(process.env.NODE_ENV === "production" ? { domain: ".seenyt.net" } : {}),
      },
    },
  },
};

export default NextAuth(authOptions);
