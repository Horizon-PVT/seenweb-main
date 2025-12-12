// pages/api/auth/[...nextauth].ts - FIXED DEFAULT EXPORT FOR PAGES ROUTER (no GET/POST)
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// ✅ ĐỊNH NGHĨA AUTHOPTIONS RIÊNG
const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',        // Đăng nhập ở trang chủ
    error: '/',         // Lỗi cũng về trang chủ
    newUser: '/',       // User mới cũng về trang chủ
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Luôn về trang chủ sau login/logout
      return baseUrl;
    },
    async session({ session, token }) {
      // Persist role từ token sang session (cho webhook/create-payment dùng)
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role;
      if (token.email) session.user.email = token.email;  // Đảm bảo email luôn có
      return session;
    },
    async jwt({ token, user }) {
      // Lưu role từ user vào token (default FREE)
      if (user) {
        token.role = user.role || 'FREE';
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',  // JWT stateless, tốt cho Vercel
  },
};

// ✅ DEFAULT EXPORT CHO PAGES ROUTER (không GET/POST, Next.js tự handle methods)
export default NextAuth(authOptions);

// ✅ NAMED EXPORT CHO IMPORT Ở CREATE-PAYMENT (fix warning)
export { authOptions };