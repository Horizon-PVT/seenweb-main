// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // BẮT BUỘC phải có 3 dòng này ở production
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },

  // QUAN TRỌNG NHẤT: force NextAuth dùng đúng domain production
  // nếu không có dòng này thì Vercel sẽ sinh ra redirect_uri kiểu *.vercel.app → bị Google chặn
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Cho phép redirect về chính domain của mình
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Cho phép callback từ Google
      else if (url.startsWith(baseUrl)) return url
      return baseUrl
    },

    async jwt({ token, account, profile }) {
      if (account) token.accessToken = account.access_token
      if (profile) {
        token.name = (profile as any).name
        token.picture = (profile as any).picture
      }
      return token
    },

    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      if (token.picture) session.user.image = token.picture as string
      return session
    },
  },

  // Tuỳ chọn: nếu anh muốn trang login đẹp hơn
  pages: {
    signIn: "/", // về trang chủ luôn
    error: "/",  // lỗi cũng về trang chủ
  },
})