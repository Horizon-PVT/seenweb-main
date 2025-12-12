// pages/api/auth/[...nextauth].ts - BẢN FIX CUỐI (không redirect dashboard nữa)
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",        // Đăng nhập ở trang chủ
    error: "/",         // Lỗi cũng về trang chủ
    newUser: "/",       // User mới cũng về trang chủ
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Luôn về trang chủ sau khi login/logout
      return baseUrl;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.role = user.role || "FREE";
      return token;
    },
  },
})