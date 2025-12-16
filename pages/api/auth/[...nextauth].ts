import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma'; // Thêm import prisma

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
      // ✅ FETCH FRESH ROLE TỪ DB MỖI LẦN (realtime sau activate)
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true, membershipExpiry: true, maxDailyUsage: true },
        });
        if (dbUser) {
          session.user.role = dbUser.role || 'FREE';
          // Nếu cần thêm expiry hoặc maxDailyUsage vào session, thêm ở đây
        }
      }
      if (token.sub) session.user.id = token.sub;
      if (token.email) session.user.email = token.email;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export default NextAuth(authOptions);
export { authOptions };