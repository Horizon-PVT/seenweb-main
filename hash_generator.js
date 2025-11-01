// File: hash_generator.js (CHỈ DÙNG ĐỂ TẠO HASH MẬT KHẨU)
const bcrypt = require('bcryptjs');

const passwordToHash = '123456'; // Mật khẩu bạn muốn hash
const saltRounds = 10;

bcrypt.hash(passwordToHash, saltRounds)
    .then(hash => {
        console.log(`\n==========================================`);
        console.log(`Mật khẩu: ${passwordToHash}`);
        console.log(`HASH MỚI ĐƯỢC TẠO TRÊN SERVER CỦA BẠN (SALT 10):`);
        console.log(`=> ${hash}`);
        console.log(`==========================================\n`);
        
        // So sánh thử nghiệm ngay lập tức (Chỉ để kiểm tra)
        return bcrypt.compare(passwordToHash, hash);
    })
    .then(result => {
        console.log(`Kiểm tra so sánh hash có thành công không: ${result ? '✅ SUCCESS' : '❌ FAILED'}`);
    })
    .catch(err => {
        console.error("Lỗi khi tạo hash:", err);
    });