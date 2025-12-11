import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextApiRequest, NextApiResponse } from "next"

// Đây là file cũ (pages/api), nên phải dùng kiểu NextApiHandler
const handler = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,

    // Nếu anh có trang login riêng thì để vậy, không có thì để "/login" cũng được
    pages: {
      signIn: "/login", // hoặc "/" cũng được
      error: "/login",   // khi lỗi sẽ quay về đây
    },

    // Để session dùng JWT (khuyên dùng cho serverless Vercel)
    session: {
      strategy: "jwt",
    },

    // Lưu thông tin Google vào database (nếu anh dùng Prisma)
    callbacks: {
      async jwt({ token, account, profile }) {
        if (account) {
          token.accessToken = account.access_token
        }
        if (profile) {
          token.name = profile.name
          token.email = profile.email
          token.picture = profile.picture
        }
        return token
      },
      async session({ session, token }) {
        session.user.id = token.sub
        return session
      },
    },
  })

export default handler