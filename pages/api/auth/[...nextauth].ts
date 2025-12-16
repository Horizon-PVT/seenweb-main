import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma'; // Đã có

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
        // Kiểm tra user đã tồn tại trong DB chưa
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // Nếu chưa tồn tại → tạo mới (đây là "đăng ký")
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
              // referrerId sẽ được apply sau (bước riêng)
              isAffiliate: false,
              totalCommission: new Prisma.Decimal(0),
              pendingCommission: new Prisma.Decimal(0),
            },
          });
        }
      }
      return true; // Cho phép sign in
    },

    async redirect({ url, baseUrl }) {
      return baseUrl;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Fetch fresh data từ DB mỗi request (realtime role sau approve)
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true, membershipExpiry: true, maxDailyUsage: true },
        });
        if (dbUser) {
          session.user.role = dbUser.role || 'FREE';
          // Có thể thêm expiry, maxDailyUsage nếu frontend cần
        }
      }
      if (token.sub) session.user.id = token.sub as string;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export default NextAuth(authOptions);
export { authOptions };