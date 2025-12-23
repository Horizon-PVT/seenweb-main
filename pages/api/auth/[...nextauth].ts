import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Giữ để dùng Prisma.Decimal

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
    error: '/',
    newUser: '/',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // Kiểm tra user tồn tại
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // Nếu chưa tồn tại → tạo mới (chỉ dùng fields tồn tại trong schema)
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || null,
                image: user.image || null,
                role: 'FREE',
                dailyUsage: 0,
                maxDailyUsage: 2,
                membershipExpiry: null,
                referrerId: null,          // Optional, sẵn cho referral sau
                affiliateCode: null,       // Optional
                isAffiliate: false,
                totalCommission: new Prisma.Decimal(0),
              },
            });
          }
          return true;
        } catch (error) {
          console.error('Error in signIn callback (create/find user):', error);
          return false;
        }
      }
      return true;
    },

    async redirect({ url, baseUrl }) {
      return baseUrl;
    },

    async jwt({ token, user, account, profile }) {
      if (user) {
        // Để trống, load từ DB dưới
      }

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
        } catch (error) {
          console.error('Error loading user in jwt callback:', error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true, membershipExpiry: true, maxDailyUsage: true },
          });
          if (dbUser) {
            session.user.role = dbUser.role || 'FREE';
          }
        } catch (error) {
          console.error('Error loading user in session callback:', error);
        }
      }

      if (token.id) {
        session.user.id = token.id as string;
      }

      if (token.role) {
        session.user.role = token.role as string;
      }

      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export default NextAuth(authOptions);
export { authOptions };