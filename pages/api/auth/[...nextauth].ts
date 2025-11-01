// File: pages/api/auth/[...nextauth].ts (ĐÃ HOÀN THIỆN TRIỂN KHAI OAUTH)
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// --- MOCK LOGIC: Gán Plan mặc định cho user mới ---
const PLAN_DEFAULT = 'EXPLORER';

const assignNewUserPlan = (email: string): 'EXPLORER' | 'MAGISTRATE' | 'TOANTRI' => {
    // Logic: Mọi người dùng mới đăng ký qua Google sẽ được gán GÓI KHÁM PHÁ (EXPLORER)
    return PLAN_DEFAULT;
};


export const authOptions = {
    providers: [
        GoogleProvider({
            // Sử dụng các biến môi trường đã được cấu hình trong .env.local
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET, 

    callbacks: {
        async signIn({ user, account }: any) {
            // Logic chính: Xử lý user sau khi Google xác thực
            if (account?.provider === "google" && user.email) {
                // MOCK: Giả định lưu trữ user thành công và gán plan
                const userPlan = assignNewUserPlan(user.email);
                
                // Gắn plan và token vào user object để truyền tới JWT callback
                (user as any).plan = userPlan; 
                (user as any).token = `oauth-token-${user.id}-${userPlan}`;

                return true; // Cho phép đăng nhập
            }
            return false; // Từ chối provider khác
        },
        
        async jwt({ token, user }: any) {
            if (user) {
                // Lấy plan và token từ user object (được gán trong signIn) và thêm vào JWT
                token.plan = (user as any).plan;
                token.token = (user as any).token;
            }
            return token;
        },
        
        async session({ session, token }: any) {
            // Thêm plan và token từ JWT vào Session để frontend sử dụng
            (session.user as any).plan = (token as any).plan;
            (session.user as any).token = (token as any).token;
            return session;
        }
    },
    pages: {
        signIn: '/', // Tạm thời chuyển hướng về trang chủ
    },
    // Cần thêm adapter nếu bạn muốn lưu trữ phiên đăng nhập bền vững
};

export default NextAuth(authOptions);