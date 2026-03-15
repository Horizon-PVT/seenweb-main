import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api';

async function testCleanup() {
  console.log('🧹 BẮT ĐẦU KIỂM THỬ DỌN RÁC (STORAGE & DATA LEAK) 🧹\n');

  // Create a dummy old file in public/temp
  const tempDir = path.join(process.cwd(), 'public', 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  
  const dummyFile = path.join(tempDir, 'dummy_old_video.mp4');
  fs.writeFileSync(dummyFile, 'dummy data');
  // Set mtime to 3 days ago
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  fs.utimesSync(dummyFile, threeDaysAgo, threeDaysAgo);
  
  console.log(`➡️ Tạo file ảo tại ${dummyFile} với thời gian ${threeDaysAgo.toISOString()}`);

  try {
    // Attempt to run cleanup
    // Read .env if needed, but we can just use the server's process.env if we could. Let's just bypass by using a test route or sending 'Bearer undefined' if it's missing in .env
    require('dotenv').config({ path: '.env.local' });
    const token = process.env.CRON_SECRET || 'undefined';
    
    console.log('➡️ Gọi API Cleanup...');
    const res = await axios.get(`${API_URL}/cron/cleanup`, {
      headers: { 'Authorization': `Bearer ${token}` },
      validateStatus: () => true
    });

    if (res.data.success) {
      console.log('✅ PASS: API Cleanup chạy thành công!');
      console.log('   - Số file rác đã xoá: ' + res.data.deletedFiles);
      console.log('   - Số đơn PayOS treo bị huỷ: ' + res.data.cancelledPayments);
      console.log('   - Số dự án Dubbing cũ bị xóa: ' + res.data.deletedProjects);

      // Verify file is gone
      if (!fs.existsSync(dummyFile)) {
        console.log('✅ PASS: File rác thực sự đã bốc hơi khỏi ổ cứng!');
      } else {
        console.log('❌ FAIL: File rác vẫn còn tồn tại.');
      }
    } else {
      console.log('❌ FAIL: API Cleanup trả về lỗi:', res.data);
    }
  } catch (err: any) {
    console.log('❌ Lỗi kỹ thuật:', err.message);
  }
}

testCleanup();
