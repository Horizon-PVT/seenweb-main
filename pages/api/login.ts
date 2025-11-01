// File: pages/api/login.ts (Sử dụng Hash Tự động Tạo)
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

// --- MOCK USER CỐ ĐỊNH (Không dùng hash cứng) ---
const mockUsersConfig = [
    {
        id: 'mock-id-001',
        email: 'test@seenyt.com',
        // Chỉ lưu mật khẩu gốc (sẽ hash khi khởi tạo)
        password: '123456', 
        plan: 'MAGISTRATE', 
    },
    {
        id: 'mock-id-002',
        email: 'admin@seenyt.com',
        password: '123456',
        plan: 'TOANTRI', 
    }
];

// Biến lưu trữ User sau khi hash (Database đã được khởi tạo)
const initializedUsers: { [email: string]: any } = {};

// --- HÀM KHỞI TẠO HASH (CHỈ CHẠY MỘT LẦN) ---
async function initializeAuthData() {
    if (Object.keys(initializedUsers).length > 0) return; // Đã khởi tạo

    console.log("[AUTH INITIALIZING] Creating secure hashes for mock users...");
    for (const userConfig of mockUsersConfig) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userConfig.password, salt);
        
        initializedUsers[userConfig.email] = {
            ...userConfig,
            passwordHash: passwordHash,
        };
        console.log(`[AUTH INITIALIZING] Hash created successfully for: ${userConfig.email}`);
    }
}
// ---------------------------------------------


interface LoginResponse { success: boolean; token: string; plan: string; }
interface ErrorResponse { error: string; }


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Đảm bảo dữ liệu được hash trước khi xử lý request
    await initializeAuthData(); 
    
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Thiếu email hoặc mật khẩu." });
    }

    // 1. TÌM KIẾM NGƯỜI DÙNG
    const user = initializedUsers[email];

    if (!user) {
        // Dùng thông báo chung để tránh tiết lộ thông tin user nào tồn tại
        return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    // 2. SO SÁNH MẬT KHẨU
    // Bây giờ, cả hash và password đều được xử lý trong cùng một môi trường Node.js.
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    // 3. TẠO TOKEN
    const token = `jwt-${user.id}-${user.plan}-${Math.random().toString(36).substring(2, 8)}`;
    
    console.log(`[AUTH LOGGED IN] User: ${user.email}. Plan: ${user.plan}.`);

    // 4. Trả về thành công
    return res.status(200).json({ 
        success: true, 
        token: token, 
        plan: user.plan 
    });

  } catch (err: any) {
    console.error("Lỗi trong API route /api/login:", err);
    res.status(500).json({ error: `Lỗi máy chủ trong quá trình đăng nhập: ${err.message || "Không xác định"}` });
  }
}