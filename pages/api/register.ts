// File: pages/api/register.ts (API Đăng ký Người dùng)
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs'; // Thư viện mã hóa mật khẩu an toàn
import crypto from 'crypto'; // Dùng để tạo ID ngẫu nhiên

// --- CẤU TRÚC DỮ LIỆU NGƯỜI DÙNG CỐT LÕI (USER SCHEMA) ---
interface UserProfile {
    id: string;
    email: string;
    passwordHash: string; 
    plan: 'EXPLORER' | 'ARCHIVE' | 'MAGISTRATE' | 'TOANTRI';
    dailyUsageCount: number;
    maxDailyUsage: number;
    createdAt: string;
}

// Hằng số cho gói Explorer
const EXPLORER_PLAN = 'EXPLORER';
const EXPLORER_MAX_USAGE = 2; // Giới hạn 2 lần/ngày

// MOCK: Giả lập Cơ sở dữ liệu (Trong thực tế, bạn sẽ dùng MongoDB/PostgreSQL client ở đây)
const mockDatabase: { [email: string]: UserProfile } = {};

interface RegisterResponse { success: boolean; message: string; userId?: string; }
interface ErrorResponse { error: string; }


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
        return res.status(400).json({ error: "Email/mật khẩu không hợp lệ (Mật khẩu cần tối thiểu 6 ký tự)." });
    }

    if (mockDatabase[email]) {
        return res.status(409).json({ error: "Email đã được đăng ký. Vui lòng đăng nhập." });
    }
    
    // 1. Mã hóa mật khẩu (sử dụng 10 rounds salt cho độ an toàn cao)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // 2. Tạo User Profile
    const userId = crypto.randomUUID();

    const newUser: UserProfile = {
        id: userId,
        email: email,
        passwordHash: passwordHash,
        plan: EXPLORER_PLAN, // <-- Gán gói miễn phí
        dailyUsageCount: 0,
        maxDailyUsage: EXPLORER_MAX_USAGE,
        createdAt: new Date().toISOString()
    };
    
    // MOCK: Lưu người dùng vào database (Ghi vào object mock)
    mockDatabase[email] = newUser;
    
    console.log(`[AUTH] User registered: ${email}. Plan: ${EXPLORER_PLAN}. Total users: ${Object.keys(mockDatabase).length}`);

    // 3. Trả về thành công
    // TRONG THỰC TẾ: Bạn sẽ tạo và trả về một JSON Web Token (JWT) ở đây cho phiên đăng nhập
    return res.status(201).json({ 
        success: true, 
        message: "Đăng ký thành công! Bạn đã được gán GÓI KHÁM PHÁ (2 lần/ngày).", 
        userId: userId 
    });

  } catch (err: any) {
    console.error("Lỗi trong API route /api/register:", err);
    res.status(500).json({ error: `Lỗi máy chủ: ${err.message || "Không xác định"}` });
  }
}