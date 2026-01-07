// File: pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { trackEvent } from "@/lib/analytics";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      if (account?.provider !== "google") return false;
      if (!user?.email) return false;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true },
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              role: "FREE",
              dailyUsage: 0,
              maxDailyUsage: 3, // Updated default to 3
              membershipExpiry: null,

              referrerId: null,
              affiliateCode: null,
              isAffiliate: false,
              totalCommission: new Prisma.Decimal(0),
            },
          });

          // Track Signup
          // Try to get anon_id from cookies if possible, but NextAuth signIn callback doesn't expose req easily here directly depending on version.
          // We rely on userId linkage.
          await trackEvent('auth_signup_success', newUser.id);
        } else {
          // Track Login
          await trackEvent('auth_login_success', existingUser.id);
        }

        return true;
      } catch (e) {
        console.error("NextAuth signIn error:", e);
        return false;
      }
    },

    // QUAN TRỌNG: KHÔNG return baseUrl cứng kiểu "return baseUrl" cho mọi case.
    // Nếu anh ép vậy thì callbackUrl "/welcome" sẽ không bao giờ chạy đúng.
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },

    async jwt({ token }) {
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: {
              id: true,
              role: true,
              membershipExpiry: true,
              maxDailyUsage: true,
            },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.membershipExpiry = dbUser.membershipExpiry;
            token.maxDailyUsage = dbUser.maxDailyUsage;
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
      return session;
    },
  },

  session: { strategy: "jwt" },
};

export default NextAuth(authOptions);
